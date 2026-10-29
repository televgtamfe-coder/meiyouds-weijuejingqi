"""研究用纯计算函数；输出Decimal，缺失不转换为零。"""
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, localcontext
from functools import wraps

D = Decimal


class ModelError(ValueError):
    def __init__(self, code, detail=''):
        self.code = code
        self.detail = detail
        super().__init__(f'{code}: {detail}')


def calculation(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        with localcontext() as ctx:
            ctx.prec = 40
            return fn(*args, **kwargs)
    return wrapped


def number(value, code='INVALID_NUMBER'):
    if value is None:
        raise ModelError('MISSING_REQUIRED_FIELD')
    if isinstance(value, bool) or not isinstance(value, (str, int, float, D)):
        raise ModelError(code)
    try:
        result = D(str(value))
    except InvalidOperation:
        raise ModelError(code) from None
    if not result.is_finite():
        raise ModelError(code)
    return result


def bounded(value, low, high, code):
    try:
        n = number(value, code)
    except ModelError:
        raise ModelError(code) from None
    if not D(str(low)) <= n <= D(str(high)):
        raise ModelError(code)
    return n


def parse_date(value):
    try:
        result = date.fromisoformat(value)
        if result.isoformat() != value:
            raise ValueError()
        return result
    except (TypeError, ValueError):
        raise ModelError('INVALID_DATE') from None


def clip(value, low, high):
    return max(low, min(high, value))


@calculation
def chronological_age(birth_date, as_of):
    """A03：闰日生日在非闰年按2月28日处理的研究日期口径。"""
    birth, current = parse_date(birth_date), parse_date(as_of)
    if birth > current:
        raise ModelError('INVALID_DATE')

    def anniversary(year):
        try:
            return birth.replace(year=year)
        except ValueError:
            return date(year, 2, 28)

    last = anniversary(current.year)
    years = current.year - birth.year
    if last > current:
        years -= 1
        last = anniversary(current.year - 1)
    if last.year >= 9999:
        raise ModelError('INVALID_DATE')
    following = anniversary(last.year + 1)
    return D(years) + D((current-last).days) / D((following-last).days)


@calculation
def normalize_vo2(value, unit, weight_kg=None):
    """A01算术子集：调用方仍须验证体重/协议/日期匹配。"""
    v = number(value)
    if v <= 0:
        raise ModelError('INVALID_NUMBER')
    if unit == 'mL/kg/min':
        return v
    if unit not in ('L/min', 'mL/min'):
        raise ModelError('INVALID_UNIT')
    w = number(weight_kg)
    if w <= 0:
        raise ModelError('INVALID_NUMBER')
    return v * (1000 if unit == 'L/min' else 1) / w


@calculation
def daily_score(scores):
    """A07：主观五项只能为整数或None，数字字符串也拒绝。"""
    keys = ('B','Y','L','PsyDaily','Udaily')
    if not isinstance(scores, dict) or set(scores) - set(keys):
        raise ModelError('INVALID_SCORE')
    for key in keys:
        v = scores.get(key)
        if v is not None and (type(v) is not int or not 0 <= v <= 6):
            raise ModelError('INVALID_SCORE', key)
    b, y, l, p, u = (scores.get(k) for k in keys)
    somatic = None if any(v is None for v in (b,y,l)) else D(b+2*y+l)/4
    complete = all(v is not None for v in (b,y,l,p,u))
    total = (8*somatic+8*p+6*u)/3 if complete else None
    return {'status':'valid' if complete else 'partial', 'somatic':somatic,
            'total':total, 'valid_for_window':complete}


@calculation
def base_age(C, S_age, M):
    """A06：上游S_age/M须显式提供，本函数不推断原算法。"""
    c = number(C)
    if not 0 <= c <= 130:
        raise ModelError('INVALID_AGE')
    values = {'C':c, 'S_age':None if S_age is None else bounded(S_age,0,130,'INVALID_AGE'),
              'M':None if M is None else bounded(M,0,130,'INVALID_AGE')}
    weights = {'C':D('.5'),'S_age':D('.3'),'M':D('.2')}
    z = sum(weights[k] for k,v in values.items() if v is not None)
    raw = sum(weights[k]*v for k,v in values.items() if v is not None)/z
    p = clip(raw,c-8,c+3)
    return {'status':'valid' if all(v is not None for v in values.values()) else 'partial',
            'P_raw':raw,'P':p,'base_clip_adjustment':p-raw,
            'weights':{k:weights[k]/z for k,v in values.items() if v is not None}}


@calculation
def symptom_window(records, start, end, as_of):
    """A09：调用者明确排除标志；本函数不推断异常或医学稳定性。"""
    first, last, cutoff = map(parse_date,(start,end,as_of))
    if (last-first).days != 27:
        raise ModelError('INVALID_WINDOW')
    seen, values, valid_dates, excluded_dates = set(), [], [], []
    for record in records:
        day = parse_date(record.get('date'))
        if not first <= day <= last:
            continue
        if day in seen:
            raise ModelError('DUPLICATE_DAY',day.isoformat())
        seen.add(day)
        excluded = record.get('excluded',False)
        if type(excluded) is not bool:
            raise ModelError('INVALID_RECORD')
        value = record.get('value')
        value = None if value is None else bounded(value,0,44,'INVALID_SCORE')
        if excluded:
            excluded_dates.append(day.isoformat())
        elif value is not None and day <= cutoff:
            values.append(value)
            valid_dates.append(day.isoformat())
    reason = 'WINDOW_INCOMPLETE' if last > cutoff else ('INSUFFICIENT_DAYS' if len(values)<14 else None)
    median = None
    if reason is None:
        values.sort()
        n = len(values)
        median = values[n//2] if n%2 else (values[n//2-1]+values[n//2])/2
    return {'status':'valid' if reason is None else 'unavailable', 'reason':reason,
            'start':start,'end':end,'valid_days':len(values),'median':median,
            'valid_dates':sorted(valid_dates),'excluded_dates':sorted(excluded_dates)}


@calculation
def reliable_threshold(sd, icc):
    """A10参数算术；sd/icc须针对实际汇总统计量另行验证。"""
    sd = bounded(sd,0,1000000,'INVALID_RELIABILITY')
    icc = bounded(icc,0,1,'INVALID_RELIABILITY')
    mdc = D('1.96') * D(2).sqrt() * sd * (1-icc).sqrt()
    return {'MDC95':mdc,'T':max(mdc,D(5))}


@calculation
def symptom_change(M0, Mt, T):
    t = bounded(T,5,1000000,'INVALID_THRESHOLD')
    m0 = None if M0 is None else bounded(M0,0,44,'INVALID_SCORE')
    mt = None if Mt is None else bounded(Mt,0,44,'INVALID_SCORE')
    if m0 is None or mt is None:
        return {'status':'unavailable','G_sym':None,'reason':'INSUFFICIENT_DAYS','T':t}
    delta = m0-mt
    net = (1 if delta>0 else -1 if delta<0 else 0)*max(abs(delta)-t,D(0))
    ratio = clip(net/max(m0,t),D(-1),D(1))
    return {'status':'valid','T':t,'delta':delta,'reliable_delta':net,
            'R_sym':ratio,'G_sym':D('-1.5')*ratio}


@calculation
def quality_score(scores):
    """A11仅实现给定四子分的几何平均，不产生或验证子分。"""
    if not isinstance(scores,(list,tuple)) or len(scores)!=4:
        raise ModelError('INVALID_QUALITY')
    product = D(1)
    for score in scores:
        product *= bounded(score,0,1,'INVALID_QUALITY')
    return product.sqrt().sqrt()


@calculation
def fuse_devices(deltas, alpha):
    """A13：None表示I=0，已合格年龄差的融合，不包含真实设备准入。"""
    allowed = {'CR','FUNCTION','BC'}
    if set(deltas)-allowed or set(alpha)-allowed or set(deltas)-set(alpha):
        raise ModelError('UNKNOWN_MODULE')
    weights = {k:bounded(v,'0.000000000001',1000000,'INVALID_WEIGHT') for k,v in alpha.items()}
    valid = {k:bounded(v,-12,8,'INVALID_AGE_DELTA') for k,v in deltas.items() if v is not None}
    if not valid:
        return {'status':'unavailable','reason':'NO_VALID_DEVICE','G_T':D(0),'G_E':D(0),
                'weights':{},'deltas':{},'device_clip_adjustment':D(0)}
    z = sum(weights[k] for k in valid)
    w = {k:weights[k]/z for k in sorted(valid)}
    gt = sum(w[k]*valid[k] for k in w)
    ge = clip(gt,D(-12),D(8))
    return {'status':'valid','G_T':gt,'G_E':ge,'weights':w,'deltas':valid,
            'device_clip_adjustment':ge-gt}


@calculation
def composite_age(C, P, G_E, lambda_, G_sym, branch='gate_lambda'):
    c,p,ge,lam,gs = map(number,(C,P,G_E,lambda_,G_sym))
    if not 0<=c<=130 or not c-8<=p<=c+3:
        raise ModelError('INVALID_AGE')
    if not -12<=ge<=8 or not D('-1.5')<=gs<=D('1.5'):
        raise ModelError('INVALID_AGE_DELTA')
    if branch == 'gate_lambda':
        if not 0<=lam<=D('.35'):
            raise ModelError('INVALID_LAMBDA')
    elif branch == 'no_lambda_research':
        if lam != 1:
            raise ModelError('INVALID_LAMBDA')
    else:
        raise ModelError('UNKNOWN_FORMULA')
    raw = p+lam*ge+gs
    limited = clip(raw,c-8,c+3)
    display = limited.quantize(D('.1'),rounding=ROUND_HALF_UP)
    gap_display = (limited-c).quantize(D('.1'),rounding=ROUND_HALF_UP)
    return {'status':'valid','raw':raw,'display_unrounded':limited,'display':display,
            'C':c,'age_gap_raw':raw-c,'age_gap_display':gap_display,
            'clip_adjustment':limited-raw,'rounding_adjustment':display-limited,
            'branch':branch}


@calculation
def current_contributions(C, P, G_sym, lambda_, fusion):
    c,p,gs,lam = map(number,(C,P,G_sym,lambda_))
    total = composite_age(c,p,fusion['G_E'],lam,gs)
    offsets = {k:lam*w*fusion['deltas'][k] for k,w in fusion['weights'].items()}
    device_clip = lam*(fusion['G_E']-fusion['G_T'])
    summed = (p-c)+gs+sum(offsets.values())+device_clip
    return {'base_offset':p-c,'symptom_offset':gs,'device_offsets':offsets,
            'device_clip_adjustment':device_clip,'display_clip_adjustment':total['clip_adjustment'],
            'raw_gap':total['age_gap_raw'],'residual':total['age_gap_raw']-summed}
