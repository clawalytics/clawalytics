import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { HelpIcon } from '@/components/icons/help-icon'
import { Header } from '@/components/layout/header'
import { LanguageSwitch } from '@/components/language-switch'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useLocale } from '@/context/locale-provider'

function FAQItem({
  question,
  answer,
}: {
  question: string
  answer: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className='flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left font-medium transition-colors hover:bg-muted/50'>
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className='px-4 pb-1 pt-3 text-muted-foreground'>
        {answer}
      </CollapsibleContent>
    </Collapsible>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className='space-y-4'>
      <h2 className='border-b pb-2 text-xl font-semibold'>{title}</h2>
      {children}
    </section>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className='rounded bg-muted px-1.5 py-0.5 text-sm font-mono'>
      {children}
    </code>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className='overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100'>
      <code>{children}</code>
    </pre>
  )
}

HelpCenter.displayName = 'HelpCenter'

export function HelpCenter() {
  const { text } = useLocale()

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <HelpIcon active className='h-6 w-6' />
          <span className='font-jersey text-xl'>
            {text('帮助中心', 'Help Center')}
          </span>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='space-y-10 px-2'>
          <div className='rounded-xl bg-red-500 p-8 text-white'>
            <Badge
              variant='secondary'
              className='mb-4 bg-white/20 text-white hover:bg-white/30'
            >
              {text('文档', 'Documentation')}
            </Badge>
            <h1 className='mb-3 text-3xl font-bold'>
              {text('欢迎使用 Clawalytics', 'Welcome to Clawalytics')}
            </h1>
            <p className='max-w-2xl text-lg text-white/90'>
              {text(
                '在一个仪表盘里追踪 AI 花费、监控代理表现，并查看 OpenClaw 与 Claude Code 的使用分析。',
                'Track AI spending, monitor agent performance, and review OpenClaw and Claude Code analytics in one dashboard.'
              )}
            </p>
          </div>

          <Section title={text('快速开始', 'Getting Started')}>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-lg border bg-card p-5'>
                <h3 className='mb-2 font-semibold'>{text('1. 安装', '1. Install')}</h3>
                <p className='mb-3 text-sm text-muted-foreground'>
                  {text('使用 npm 或 pnpm 全局安装。', 'Install globally with npm or pnpm.')}
                </p>
                <CodeBlock>{`npm install -g clawalytics`}</CodeBlock>
              </div>
              <div className='rounded-lg border bg-card p-5'>
                <h3 className='mb-2 font-semibold'>{text('2. 启动', '2. Start')}</h3>
                <p className='mb-3 text-sm text-muted-foreground'>
                  {text('启动服务并打开本地仪表盘。', 'Start the service and open the local dashboard.')}
                </p>
                <CodeBlock>{`clawalytics start`}</CodeBlock>
              </div>
              <div className='rounded-lg border bg-card p-5'>
                <h3 className='mb-2 font-semibold'>{text('3. 查看数据', '3. View Data')}</h3>
                <p className='text-sm text-muted-foreground'>
                  {text(
                    '默认地址是 ',
                    'The dashboard is available at '
                  )}
                  <InlineCode>http://localhost:9174</InlineCode>
                </p>
              </div>
            </div>
          </Section>

          <Section title={text('核心功能', 'Core Features')}>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border bg-card p-5'>
                <h3 className='mb-2 font-semibold'>
                  {text('成本与 Token 分析', 'Cost and Token Analytics')}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {text(
                    '查看总成本、每日趋势、模型分布、缓存节省，以及输入输出 Token 结构。',
                    'Review total cost, daily trends, model distribution, cache savings, and input/output token breakdowns.'
                  )}
                </p>
              </div>
              <div className='rounded-lg border bg-card p-5'>
                <h3 className='mb-2 font-semibold'>
                  {text('会话与项目维度', 'Sessions and Projects')}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {text(
                    '按项目查看会话历史、会话成本和请求明细。',
                    'Inspect session history, cost, and request details by project.'
                  )}
                </p>
              </div>
              <div className='rounded-lg border bg-card p-5'>
                <h3 className='mb-2 font-semibold'>
                  {text('OpenClaw 代理与渠道', 'OpenClaw Agents and Channels')}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {text(
                    '比较不同代理和消息渠道的成本、消息量与使用强度。',
                    'Compare costs, message volume, and usage intensity across agents and messaging channels.'
                  )}
                </p>
              </div>
              <div className='rounded-lg border bg-card p-5'>
                <h3 className='mb-2 font-semibold'>
                  {text('安全与审计', 'Security and Audit')}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {text(
                    '监控设备、连接、告警和审计日志，帮助排查异常行为。',
                    'Monitor devices, connections, alerts, and audit logs to investigate abnormal activity.'
                  )}
                </p>
              </div>
            </div>
          </Section>

          <Section title={text('常用命令', 'Common Commands')}>
            <div className='rounded-lg border bg-card p-5'>
              <div className='space-y-2 text-sm'>
                <div className='flex gap-4'>
                  <InlineCode>clawalytics start</InlineCode>
                  <span className='text-muted-foreground'>
                    {text('启动仪表盘', 'Start the dashboard')}
                  </span>
                </div>
                <div className='flex gap-4'>
                  <InlineCode>clawalytics config</InlineCode>
                  <span className='text-muted-foreground'>
                    {text('查看当前配置', 'View current configuration')}
                  </span>
                </div>
                <div className='flex gap-4'>
                  <InlineCode>clawalytics path [dir]</InlineCode>
                  <span className='text-muted-foreground'>
                    {text('设置日志路径', 'Set a custom log path')}
                  </span>
                </div>
                <div className='flex gap-4'>
                  <InlineCode>clawalytics mcp</InlineCode>
                  <span className='text-muted-foreground'>
                    {text('启动 MCP 服务', 'Start the MCP server')}
                  </span>
                </div>
              </div>
            </div>
          </Section>

          <Section title={text('配置示例', 'Configuration Example')}>
            <CodeBlock>{`openClawPath: ~/.openclaw
gatewayLogsPath: /tmp/openclaw
securityAlertsEnabled: true

alertThresholds:
  dailyBudget: 10
  weeklyBudget: 50
  monthlyBudget: 200`}</CodeBlock>
          </Section>

          <Section title={text('常见问题', 'Frequently Asked Questions')}>
            <div className='space-y-3'>
              <FAQItem
                question={text(
                  '为什么仪表盘没有数据？',
                  'Why is my dashboard empty?'
                )}
                answer={
                  <ul className='list-disc space-y-1 pl-5 text-sm'>
                    <li>
                      {text(
                        '确认 OpenClaw 正在运行，并且代理已经发起 API 调用。',
                        'Make sure OpenClaw is running and agents are making API calls.'
                      )}
                    </li>
                    <li>
                      {text(
                        '确认网关日志目录和代理配置路径正确。',
                        'Verify the gateway log directory and agent configuration path.'
                      )}
                    </li>
                    <li>
                      {text(
                        '使用 ',
                        'Use '
                      )}
                      <InlineCode>clawalytics config</InlineCode>
                      {text(' 检查当前配置。', ' to inspect your current configuration.')}
                    </li>
                  </ul>
                }
              />
              <FAQItem
                question={text(
                  'Clawalytics 会把数据上传到外部吗？',
                  'Does Clawalytics send data externally?'
                )}
                answer={
                  <p className='text-sm'>
                    {text(
                      '不会。数据默认保存在你的本地 SQLite 数据库中。',
                      'No. Data is stored locally in your SQLite database by default.'
                    )}
                  </p>
                }
              />
              <FAQItem
                question={text('如何修改端口？', 'How do I change the port?')}
                answer={
                  <p className='text-sm'>
                    <InlineCode>clawalytics start --port 3005</InlineCode>
                    {text(
                      ' 可以指定端口，也可以通过环境变量 PORT 配置。',
                      ' lets you choose a port, or you can configure it with the PORT environment variable.'
                    )}
                  </p>
                }
              />
            </div>
          </Section>

          <div className='rounded-lg bg-muted/50 p-6 text-center text-sm text-muted-foreground'>
            {text(
              '如果你还需要更完整的中文文档或中英对照说明，我可以继续把 README 和 CLI 帮助文本也一起本地化。',
              'If you want fuller Chinese documentation or bilingual CLI help, we can localize the README and CLI help text next.'
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
