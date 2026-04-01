import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLocale } from '@/context/locale-provider'
import type { ModelUsageItem } from '@/lib/api'

interface ModelsTableProps {
  models: ModelUsageItem[]
}

export function ModelsTable({ models }: ModelsTableProps) {
  const { text } = useLocale()

  const formatCurrency = (value: number): string => {
    if (value >= 100) return `$${value.toFixed(0)}`
    if (value >= 10) return `$${value.toFixed(1)}`
    if (value >= 1) return `$${value.toFixed(2)}`
    if (value >= 0.01) return `$${value.toFixed(2)}`
    return `$${value.toFixed(4)}`
  }

  const formatNumber = (value: number): string => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toString()
  }

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      anthropic:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      openai:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      google:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      moonshot:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      deepseek:
        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      openrouter:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      meta:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      mistral:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    }

    return (
      colors[provider.toLowerCase()] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    )
  }

  if (models.length === 0) {
    return (
      <div className='py-8 text-center text-muted-foreground'>
        {text(
          '还没有模型使用数据。开始使用 OpenClaw 后，这里会显示模型分析。',
          'No model usage yet. Start using OpenClaw to see model analytics.'
        )}
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{text('模型', 'Model')}</TableHead>
            <TableHead>{text('提供商', 'Provider')}</TableHead>
            <TableHead className='text-right'>
              {text('输入 Token', 'Input Tokens')}
            </TableHead>
            <TableHead className='text-right'>
              {text('输出 Token', 'Output Tokens')}
            </TableHead>
            <TableHead className='text-right'>{text('请求数', 'Requests')}</TableHead>
            <TableHead className='text-right'>{text('成本', 'Cost')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model, idx) => (
            <TableRow key={`${model.provider}-${model.model}-${idx}`}>
              <TableCell className='font-medium'>{model.model}</TableCell>
              <TableCell>
                <Badge variant='outline' className={getProviderColor(model.provider)}>
                  {model.provider}
                </Badge>
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatNumber(model.inputTokens)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatNumber(model.outputTokens)}
              </TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatNumber(model.requestCount)}
              </TableCell>
              <TableCell className='text-right tabular-nums font-medium text-red-600 dark:text-red-400'>
                {formatCurrency(model.cost)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
