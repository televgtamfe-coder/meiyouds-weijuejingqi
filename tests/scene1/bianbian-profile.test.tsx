import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BianbianPage } from '../../src/scenes/scene1/bianbian/BianbianPage';
beforeEach(() => sessionStorage.clear());
const renderPage = () => render(<MemoryRouter><BianbianPage /></MemoryRouter>);
async function complete(user: ReturnType<typeof userEvent.setup>) {
 await user.click(screen.getByRole('button', {name:'下一步',exact:true}));
 await user.click(screen.getByRole('button', {name:'下一步',exact:true}));
 await user.click(screen.getByRole('button', {name:'完成',exact:true}));
}
describe('三步资料与参考版导航', () => {
 it('预填资料，三步确认后到首页，同会话不重复向导', async () => {
  const user=userEvent.setup();const first=renderPage();
  expect(screen.getByLabelText('宝宝昵称')).toHaveValue('小柚子');
  await user.click(screen.getByRole('button',{name:'下一步',exact:true}));
  expect(screen.getByRole('heading',{name:'02 喂养方式'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'下一步',exact:true}));
  expect(screen.getByRole('heading',{name:'03 过敏情况'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'完成',exact:true}));
  expect(screen.getByRole('heading',{name:'历史报告'})).toBeVisible();
  first.unmount();renderPage();expect(screen.queryByLabelText('宝宝昵称')).not.toBeInTheDocument();
 });
 it('修改取消不覆盖档案，拍照入口直接进入取景框并保留相册', async () => {
  const user=userEvent.setup();renderPage();await complete(user);
  await user.click(screen.getByRole('button',{name:'修改宝宝资料'}));
  await user.clear(screen.getByLabelText('宝宝昵称'));await user.type(screen.getByLabelText('宝宝昵称'),'不保存');
  await user.click(screen.getByRole('button',{name:'取消修改'}));
  expect(screen.getByText('小柚子')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'拍照分析',exact:true}));
  expect(screen.getByRole('dialog',{name:'拍摄便便照片'})).toBeVisible();
  expect(screen.getByRole('button',{name:'拍摄照片',exact:true})).toBeVisible();
  expect(screen.getByRole('button',{name:'相册'})).toBeVisible();
 });
 it('设置入口与会员预览有退出路径，不声称付费已开通', async () => {
  const user=userEvent.setup();renderPage();await complete(user);
  await user.click(screen.getByRole('button',{name:'我的',exact:true}));
  await user.click(screen.getByRole('button',{name:'升级专业版'}));
  expect(screen.getByText('会员页面预览 · 暂不收费')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'暂不开通，继续分析'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 });
});
