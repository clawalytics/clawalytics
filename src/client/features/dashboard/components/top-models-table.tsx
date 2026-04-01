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
import type { ModelUsage } from '@/lib/api'

interface TopModelsTableProps {
  models: ModelUsage[]
}

export function TopModelsTable({ models }: TopModelsTableProps) {
  const { text } = useLocale()

  const formatCurrency = (value: number): string => {
    if (value >= 100) return `$${value.toFixed(0)}`
    if (value >= 10) return `$${value.toFixed(1)}`
    if (value >= 1) return `$${value.toFixed(2)}`
    if (value >= 0.01) return `$${value.toFixed(2)}`
    return `$${value.toFixed(4)}`
  }

  const formatNumber = (value: number): string => {
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
    }
    return (
      colors[provider.toLowerCase()] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    )
  }

  const topModels = [...models].sort((a, b) => b.cost - a.cost).slice(0, 5)

  if (topModels.length === 0) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{text('模型', 'Model')}</TableHead>
          <TableHead>{text('提供商', 'Provider')}</TableHead>
          <TableHead className='text-right'>{text('Tokens', 'Tokens')}</TableHead>
          <TableHead className='text-right'>{text('成本', 'Cost')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topModels.map((model, idx) => (
          <TableRow key={`${model.provider}-${model.model}-${idx}`}>
            <TableCell className='max-w-[180px] truncate font-medium'>
              {model.model}
            </TableCell>
            <TableCell>
              <Badge variant='outline' className={getProviderColor(model.provider)}>
                {model.provider}
              </Badge>
            </TableCell>
            <TableCell className='text-right tabular-nums text-muted-foreground'>
              {formatNumber(model.input_tokens + model.output_tokens)}
            </TableCell>
            <TableCell className='text-right tabular-nums font-medium text-red-600 dark:text-red-400'>
              {formatCurrency(model.cost)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

TopModelsTable.displayName = 'TopModelsTable'
