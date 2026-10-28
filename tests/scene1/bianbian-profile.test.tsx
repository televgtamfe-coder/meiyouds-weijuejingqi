import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BianbianPage } from '../../src/scenes/scene1/bianbian/BianbianPage';
beforeEach(() => {sessionStorage.clear();localStorage.clear();});
const renderPage = () => render(<MemoryRouter><BianbianPage /></MemoryRouter>);
async function activate(user: ReturnType<typeof userEvent.setup>) {
 await user.click(screen.getByRole('button',{name:'立即开通',exact:true}));
 await user.click(screen.getByRole('button',{name:'模拟开通并继续',exact:true}));
}
async function complete(user: ReturnType<typeof userEvent.setup>) {
 await activate(user);
 await user.click(screen.getByRole('button', {name:'下一步',exact:true}));
 await user.click(screen.getByRole('button', {name:'完成',exact:true}));
 await user.click(screen.getByRole('button',{name:'关闭相机',exact:true}));
}
describe('三步资料与参考版导航', () => {
 it('首次示例与模拟开通，确认后直接拍照，再次进入不重复向导', async () => {
  const user=userEvent.setup();const first=renderPage();
  expect(screen.getByRole('article',{name:'便便解读示例'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'立即开通',exact:true}));
  await user.click(screen.getByRole('button',{name:'关闭会员页，返回示例'}));
  expect(screen.queryByLabelText('宝宝昵称')).not.toBeInTheDocument();
  await activate(user);
  expect(screen.queryByLabelText('宝宝昵称')).not.toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'02 喂养方式'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'下一步',exact:true}));
  expect(screen.getByRole('heading',{name:'03 过敏情况'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'完成',exact:true}));
  expect(screen.getByRole('dialog',{name:'拍摄便便照片'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'关闭相机'}));
  expect(screen.getByRole('heading',{name:/历史报告/})).toBeVisible();
  expect(screen.queryByText('联合智能分析')).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'查看报告示例'})).not.toBeInTheDocument();expect(screen.queryByRole('heading',{name:'智能提醒'})).not.toBeInTheDocument();
  first.unmount();sessionStorage.clear();renderPage();expect(screen.queryByLabelText('宝宝昵称')).not.toBeInTheDocument();
 });
 it('首页不显示月龄和头像，拍照入口直接进入取景框并保留相册', async () => {
  const user=userEvent.setup();renderPage();await complete(user);
  expect(screen.queryByRole('button',{name:'修改宝宝资料'})).not.toBeInTheDocument();
  expect(screen.queryByText('4个月')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'拍照分析',exact:true}));
  expect(screen.getByRole('dialog',{name:'拍摄便便照片'})).toBeVisible();
  expect(screen.getByRole('button',{name:'拍摄照片',exact:true})).toBeVisible();
  expect(screen.getByRole('button',{name:'相册'})).toBeVisible();
 });
 it('重置返回首次示例但保留基础资料，原设置入口删除', async () => {
  const user=userEvent.setup();renderPage();await complete(user);
  expect(screen.queryByRole('button',{name:'功能设置'})).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'重置',exact:true}));
  expect(screen.getByRole('article',{name:'便便解读示例'})).toBeVisible();
  await activate(user);expect(screen.getByRole('heading',{name:'02 喂养方式'})).toBeVisible();
 });
});

it('首页标签直达单项修改，保存生效，取消不覆盖',async()=>{
 const user=userEvent.setup();renderPage();await complete(user);
 await user.click(screen.getByRole('button',{name:'修改喂养方式',exact:true}));
 expect(screen.getByRole('heading',{name:'喂养方式',exact:true})).toBeVisible();
 await user.click(screen.getByRole('button',{name:/纯母乳喂养/}));await user.click(screen.getByRole('button',{name:'保存修改',exact:true}));
 expect(screen.getByRole('button',{name:'修改喂养方式'})).toHaveTextContent('纯母乳喂养');
 await user.click(screen.getByRole('button',{name:'修改过敏原'}));await user.click(screen.getByRole('button',{name:'牛奶及乳制品'}));await user.click(screen.getByRole('button',{name:'取消修改'}));
 expect(screen.getByRole('button',{name:'修改过敏原'})).toHaveTextContent('无已知过敏');
 await user.click(screen.getByRole('button',{name:'修改过敏原'}));await user.click(screen.getByRole('button',{name:'牛奶及乳制品'}));await user.click(screen.getByRole('button',{name:'保存修改'}));
 expect(screen.getByRole('button',{name:'修改过敏原'})).toHaveTextContent('牛奶及乳制品');
});

it('奶粉品牌填写后显示，独立编辑可取消、保存与清空',async()=>{
 const user=userEvent.setup();let view=renderPage();await complete(user);
 expect(screen.queryByRole('button',{name:'修改奶粉品牌',exact:true})).not.toBeInTheDocument();
 await user.click(screen.getByRole('button',{name:'修改喂养方式',exact:true}));await user.type(screen.getByLabelText('奶粉品牌'),'品牌甲');await user.click(screen.getByRole('button',{name:'保存修改',exact:true}));
 expect(screen.getByRole('button',{name:'修改奶粉品牌'})).toHaveTextContent('品牌甲');
 await user.click(screen.getByRole('button',{name:'修改奶粉品牌'}));expect(screen.getByRole('heading',{name:'修改奶粉品牌',exact:true})).toBeVisible();expect(screen.queryByRole('group',{name:'喂养方式'})).not.toBeInTheDocument();
 await user.clear(screen.getByLabelText('奶粉品牌'));await user.type(screen.getByLabelText('奶粉品牌'),'品牌乙');await user.click(screen.getByRole('button',{name:'取消修改',exact:true}));expect(screen.getByRole('button',{name:'修改奶粉品牌'})).toHaveTextContent('品牌甲');
 await user.click(screen.getByRole('button',{name:'修改奶粉品牌'}));await user.clear(screen.getByLabelText('奶粉品牌'));await user.type(screen.getByLabelText('奶粉品牌'),'品牌乙');await user.click(screen.getByRole('button',{name:'保存修改',exact:true}));view.unmount();view=renderPage();expect(screen.getByRole('button',{name:'修改奶粉品牌'})).toHaveTextContent('品牌乙');
 await user.click(screen.getByRole('button',{name:'修改奶粉品牌'}));await user.clear(screen.getByLabelText('奶粉品牌'));await user.click(screen.getByRole('button',{name:'保存修改',exact:true}));expect(screen.queryByRole('button',{name:'修改奶粉品牌'})).not.toBeInTheDocument();
});
