import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BianbianPage } from '../../src/scenes/scene1/bianbian/BianbianPage';

beforeEach(() => sessionStorage.clear());
const renderPage = () => render(<MemoryRouter><BianbianPage /></MemoryRouter>);
describe('首次宝宝档案确认', () => {
  it('首次预填模拟档案，确认后才进入照片流程，同一会话不重复弹出', async () => {
    const user = userEvent.setup(); const first = renderPage();
    expect(await screen.findByRole('dialog', { name: '首次分析，请确认宝宝基本信息' })).toBeVisible();
    expect(screen.getByLabelText('宝宝昵称')).toHaveValue('小柚子');
    expect(screen.getByText('示例档案')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '确认信息，开始分析' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加照片' })).toBeVisible();
    expect(screen.queryByRole('button', { name: '拍一张' })).not.toBeInTheDocument();
    first.unmount(); renderPage();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('修改资料保存后更新摘要，取消修改不覆盖已确认资料', async () => {
    const user = userEvent.setup(); renderPage();
    await user.clear(screen.getByLabelText('宝宝昵称')); await user.type(screen.getByLabelText('宝宝昵称'), '小宝');
    await user.click(screen.getByRole('button', { name: '确认信息，开始分析' }));
    expect(screen.getByText('小宝')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '修改宝宝信息' }));
    await user.clear(screen.getByLabelText('宝宝昵称')); await user.type(screen.getByLabelText('宝宝昵称'), '不保存');
    await user.click(screen.getByRole('button', { name: '取消修改' }));
    expect(screen.getByText('小宝')).toBeVisible();
  });
  it('照片入口只有一个，点击后再选择拍照或相册', async () => {
    const user = userEvent.setup(); renderPage();
    await user.click(screen.getByRole('button', { name: '确认信息，开始分析' }));
    await user.click(screen.getByRole('button', { name: '添加照片' }));
    expect(screen.getByRole('dialog', { name: '添加便便照片' })).toBeVisible();
    expect(screen.getByRole('button', { name: '拍照' })).toBeVisible();
    expect(screen.getByRole('button', { name: '从相册选择' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
