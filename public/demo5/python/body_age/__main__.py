"""命令行：python -m body_age --input input.json --output output.json。"""
import argparse
import json
from pathlib import Path
import sys
from .pipeline import evaluate


def unique_object(pairs):
    result={}
    for key,value in pairs:
        if key in result:
            raise ValueError('DUPLICATE_JSON_KEY')
        result[key]=value
    return result


def reject_constant(value):
    raise ValueError('INVALID_JSON_NUMBER')


def main():
    parser=argparse.ArgumentParser(description='身体年龄合成研究计算，禁止正式发布')
    parser.add_argument('--input',required=True,help='UTF-8 JSON合成输入文件')
    parser.add_argument('--output',help='结果JSON；省略则输出到标准输出')
    args=parser.parse_args()
    source=Path(args.input).resolve()
    target=Path(args.output).resolve() if args.output else None
    if source==target:
        print('INPUT_OUTPUT_SAME_PATH',file=sys.stderr)
        return 2
    try:
        request=json.loads(source.read_text(encoding='utf-8-sig'),object_pairs_hook=unique_object,
                           parse_constant=reject_constant)
    except json.JSONDecodeError:
        print('INVALID_JSON',file=sys.stderr)
        return 2
    except ValueError as exc:
        print(str(exc),file=sys.stderr)
        return 2
    except OSError:
        print('INPUT_READ_FAILED',file=sys.stderr)
        return 2
    result=evaluate(request)
    payload=json.dumps(result,ensure_ascii=False,allow_nan=False,indent=2)+'\n'
    try:
        if target:
            target.write_text(payload,encoding='utf-8')
        else:
            if hasattr(sys.stdout,'reconfigure'):
                sys.stdout.reconfigure(encoding='utf-8')
            sys.stdout.write(payload)
    except OSError:
        print('OUTPUT_WRITE_FAILED',file=sys.stderr)
        return 2
    return 0 if result['status']=='research_only' else 1


if __name__=='__main__':
    raise SystemExit(main())
