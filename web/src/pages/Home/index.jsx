/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import { Button, Typography } from '@douyinfe/semi-ui';
import { API, showError } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconFile,
  IconKey,
  IconBolt,
  IconShield,
  IconTickCircle,
  IconArrowRight,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import { OpenAI, Claude, Gemini, DeepSeek } from '@lobehub/icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          {/* Hero 区 */}
          <section className='relative pt-32 pb-24 lg:pt-40 lg:pb-32 text-center px-4 overflow-hidden border-b border-semi-color-border'>
            {/* 背景模糊晕染球 */}
            <div className='blur-ball blur-ball-indigo' />
            <div className='blur-ball blur-ball-teal' />

            <div className='max-w-4xl mx-auto space-y-8 relative z-10'>
              <h1
                className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-semi-color-text-0 leading-tight ${isChinese ? 'tracking-wide md:tracking-wider' : ''}`}
              >
                <span className='shine-text'>
                  {t('一站式 AI 模型 API')}
                  <br />
                  {t('中转服务')}
                </span>
              </h1>

              <p className='text-lg md:text-xl text-semi-color-text-1 max-w-3xl mx-auto leading-relaxed font-normal'>
                <span className='inline-block'>
                  {t('Claude、OpenAI、Gemini 统一接入，')}
                </span>
                <span className='inline-block'>
                  {t('付费即取专属 API Key，')}
                </span>
                <span className='inline-block'>
                  {t('直接调用无需额外配置！')}
                </span>
              </p>

              {/* CTA 按钮 */}
              <div className='flex flex-col sm:flex-row justify-center gap-4 mt-10'>
                <Link to='/console'>
                  <Button
                    theme='solid'
                    type='primary'
                    size={isMobile ? 'default' : 'large'}
                    className='!rounded-3xl px-10 py-4'
                    icon={<IconArrowRight />}
                    iconPosition='right'
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <Button
                    size={isMobile ? 'default' : 'large'}
                    className='!rounded-3xl px-6 py-4'
                    icon={<IconGithubLogo />}
                    onClick={() =>
                      window.open(
                        'https://github.com/QuantumNous/new-api',
                        '_blank',
                      )
                    }
                  >
                    {statusState.status.version}
                  </Button>
                ) : (
                  docsLink && (
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className='!rounded-3xl px-6 py-4'
                      icon={<IconFile />}
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      {t('文档')}
                    </Button>
                  )
                )}
              </div>

              {/* 特性标签 */}
              <div className='pt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm'>
                <div className='flex items-center gap-2 text-semi-color-text-2'>
                  <div
                    className='w-8 h-8 rounded-full flex items-center justify-center'
                    style={{
                      color: 'var(--semi-color-success-light-default)',
                    }}
                  >
                    <IconTickCircle
                      size='default'
                      style={{ color: 'var(--semi-color-success)' }}
                    />
                  </div>
                  <span>{t('99.9% 在线率')}</span>
                </div>
                <div className='flex items-center gap-2 text-semi-color-text-2'>
                  <div
                    className='w-8 h-8 rounded-full flex items-center justify-center'
                    style={{
                      color: 'var(--semi-color-success-light-default)',
                    }}
                  >
                    <IconTickCircle
                      size='default'
                      style={{ color: 'var(--semi-color-success)' }}
                    />
                  </div>
                  <span>{t('ISO 27001 认证')}</span>
                </div>
                <div className='flex items-center gap-2 text-semi-color-text-2'>
                  <div
                    className='w-8 h-8 rounded-full flex items-center justify-center'
                    style={{
                      color: 'var(--semi-color-success-light-default)',
                    }}
                  >
                    <IconTickCircle
                      size='default'
                      style={{ color: 'var(--semi-color-success)' }}
                    />
                  </div>
                  <span>{t('即时接入')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 核心平台特色区 */}
          <section className='py-24 bg-semi-color-bg-0 relative'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <div className='text-center mb-20'>
                <h2 className='text-3xl font-bold text-semi-color-text-0 mb-4 tracking-tight'>
                  {t('核心平台特色')}
                </h2>
                <p className='text-semi-color-text-1 max-w-2xl mx-auto text-lg'>
                  {t('为您构建生产级 AI 应用提供一切所需。')}
                </p>
              </div>

              <div className='grid sm:grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
                {/* 特性卡片 1 */}
                <div className='group p-8 bg-semi-color-bg-1 rounded-2xl border border-semi-color-border shadow-sm hover:shadow-lg transition-all duration-300'>
                  <div
                    className='w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'
                    style={{
                      background:
                        'linear-gradient(135deg, var(--semi-color-primary-light-default), var(--semi-color-primary))',
                      color: '#fff',
                      boxShadow:
                        '0 10px 25px -5px rgba(var(--semi-blue-5), 0.3)',
                    }}
                  >
                    <IconKey size='extra-large' />
                  </div>
                  <h3 className='text-lg font-bold mb-3 text-semi-color-text-0'>
                    {t('统一接入，一键获取多模型 API Key')}
                  </h3>
                  <p className='text-sm text-semi-color-text-1 leading-relaxed'>
                    {t(
                      '全面兼容 OpenAI、Claude 以及 Gemini 等主流节点。只需一个 API 密钥，即可无缝切换全球顶级 AI 模型。',
                    )}
                  </p>
                </div>

                {/* 特性卡片 2 */}
                <div className='group p-8 bg-semi-color-bg-1 rounded-2xl border border-semi-color-border shadow-sm hover:shadow-lg transition-all duration-300'>
                  <div
                    className='w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'
                    style={{
                      background:
                        'linear-gradient(135deg, var(--semi-color-secondary-light-default), var(--semi-color-secondary))',
                      color: '#fff',
                      boxShadow:
                        '0 10px 25px -5px rgba(var(--semi-indigo-5), 0.3)',
                    }}
                  >
                    <IconBolt size='extra-large' />
                  </div>
                  <h3 className='text-lg font-bold mb-3 text-semi-color-text-0'>
                    {t('付费即取，密钥实时生效')}
                  </h3>
                  <p className='text-sm text-semi-color-text-1 leading-relaxed'>
                    {t(
                      '自动化交付流程，支付完成后立即生成专属 API 密钥。告别等待，让您的创意与开发瞬间同步。',
                    )}
                  </p>
                </div>

                {/* 特性卡片 3 */}
                <div className='group p-8 bg-semi-color-bg-1 rounded-2xl border border-semi-color-border shadow-sm hover:shadow-lg transition-all duration-300'>
                  <div
                    className='w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'
                    style={{
                      background:
                        'linear-gradient(135deg, var(--semi-color-success-light-default), var(--semi-color-success))',
                      color: '#fff',
                      boxShadow:
                        '0 10px 25px -5px rgba(var(--semi-green-5), 0.3)',
                    }}
                  >
                    <IconShield size='extra-large' />
                  </div>
                  <h3 className='text-lg font-bold mb-3 text-semi-color-text-0'>
                    {t('安全合规，企业级数据信任')}
                  </h3>
                  <p className='text-sm text-semi-color-text-1 leading-relaxed'>
                    {t(
                      '采用透明代理机制，严格遵循 ISO27001 与 SOC2 认证标准，确保企业级数据的隐私性与调用合规性。',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 支持的服务商区 */}
          <section className='py-24 bg-semi-color-bg-0 border-y border-semi-color-border'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <div className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6'>
                <div>
                  <h2 className='text-3xl font-bold text-semi-color-text-0 mb-4 tracking-tight'>
                    {t('支持的服务商')}
                  </h2>
                  <p className='text-semi-color-text-1 text-lg'>
                    {t('即刻连接全球最强大的 AI 模型。')}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {/* Claude 卡片 */}
                <div className='bg-semi-color-bg-1 p-7 rounded-2xl border border-semi-color-border shadow-sm hover:shadow-lg transition-all duration-300 flex items-center space-x-5'>
                  <div className='w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0'>
                    <Claude.Color size={32} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-0.5'>
                      <div className='font-bold text-semi-color-text-0 truncate'>
                        Claude
                      </div>
                      <span
                        className='w-2 h-2 bg-green-500 rounded-full'
                        title={t('在线')}
                      ></span>
                    </div>
                    <div className='text-sm text-semi-color-text-2'>
                      Anthropic
                    </div>
                  </div>
                </div>

                {/* OpenAI 卡片 */}
                <div className='bg-semi-color-bg-1 p-7 rounded-2xl border border-semi-color-border shadow-sm hover:shadow-lg transition-all duration-300 flex items-center space-x-5'>
                  <div className='w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shrink-0'>
                    <OpenAI size={32} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-0.5'>
                      <div className='font-bold text-semi-color-text-0 truncate'>
                        OpenAI
                      </div>
                      <span
                        className='w-2 h-2 bg-green-500 rounded-full'
                        title={t('在线')}
                      ></span>
                    </div>
                    <div className='text-sm text-semi-color-text-2'>
                      GPT-4o, GPT-4
                    </div>
                  </div>
                </div>

                {/* Gemini 卡片 */}
                <div className='bg-semi-color-bg-1 p-7 rounded-2xl border border-semi-color-border shadow-sm hover:shadow-lg transition-all duration-300 flex items-center space-x-5'>
                  <div className='w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0'>
                    <Gemini.Color size={32} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-0.5'>
                      <div className='font-bold text-semi-color-text-0 truncate'>
                        Gemini
                      </div>
                      <span
                        className='w-2 h-2 bg-green-500 rounded-full'
                        title={t('在线')}
                      ></span>
                    </div>
                    <div className='text-sm text-semi-color-text-2'>
                      Google DeepMind
                    </div>
                  </div>
                </div>

                {/* DeepSeek 卡片 */}
                <div className='bg-semi-color-bg-1 p-7 rounded-2xl border border-semi-color-border shadow-sm hover:shadow-lg transition-all duration-300 flex items-center space-x-5'>
                  <div className='w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0'>
                    <DeepSeek.Color size={32} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-0.5'>
                      <div className='font-bold text-semi-color-text-0 truncate'>
                        DeepSeek
                      </div>
                      <span
                        className='w-2 h-2 bg-green-500 rounded-full'
                        title={t('在线')}
                      ></span>
                    </div>
                    <div className='text-sm text-semi-color-text-2'>
                      DeepSeek AI
                    </div>
                  </div>
                </div>
              </div>

              {/* 完整模型列表提示 */}
              <div className='mt-8 text-center'>
                <Text type='tertiary' className='text-sm'>
                  {t('支持众多的大模型供应商')} • 30+ {t('查看完整模型列表')}
                </Text>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
