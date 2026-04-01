import { Link } from '@tanstack/react-router'
import { ArrowUpDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLocale } from '@/context/locale-provider'
import type { Agent } from '@/lib/api'
import { formatRelativeTime } from '@/lib/i18n'

interface AgentsTableProps {
  agents: Agent[]
}

type SortField = 'name' | 'total_cost' | 'session_count' | 'created_at'
type SortDirection = 'asc' | 'desc'

export function AgentsTable({ agents }: AgentsTableProps) {
  const { locale, text } = useLocale()
  const [sortField, setSortField] = useState<SortField>('total_cost')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedAgents = [...agents].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1

    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name)
      case 'total_cost':
        return multiplier * (a.total_cost - b.total_cost)
      case 'session_count':
        return multiplier * (a.session_count - b.session_count)
      case 'created_at':
        return (
          multiplier *
          (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        )
      default:
        return 0
    }
  })

  if (agents.length === 0) {
    return (
      <div className='flex h-32 items-center justify-center text-muted-foreground'>
        {text(
          '未找到代理。请先把 OpenClaw 连接到消息渠道。',
          'No agents found. Connect OpenClaw to a message channel first.'
        )}
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                className='-ml-3 h-8'
                onClick={() => handleSort('name')}
              >
                {text('名称', 'Name')}
                <ArrowUpDown className='ml-2 h-4 w-4' />
              </Button>
            </TableHead>
            <TableHead>{text('工作区', 'Workspace')}</TableHead>
            <TableHead className='text-right'>
              <Button
                variant='ghost'
                size='sm'
                className='-mr-3 h-8'
                onClick={() => handleSort('total_cost')}
              >
                {text('成本', 'Cost')}
                <ArrowUpDown className='ml-2 h-4 w-4' />
              </Button>
            </TableHead>
            <TableHead className='text-right'>
              {text('输入 Token', 'Input Tokens')}
            </TableHead>
            <TableHead className='text-right'>
              {text('输出 Token', 'Output Tokens')}
            </TableHead>
            <TableHead className='text-right'>
              <Button
                variant='ghost'
                size='sm'
                className='-mr-3 h-8'
                onClick={() => handleSort('session_count')}
              >
                {text('会话数', 'Sessions')}
                <ArrowUpDown className='ml-2 h-4 w-4' />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                className='-ml-3 h-8'
                onClick={() => handleSort('created_at')}
              >
                {text('创建时间', 'Created')}
                <ArrowUpDown className='ml-2 h-4 w-4' />
              </Button>
            </TableHead>
            <TableHead className='w-10' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAgents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className='font-medium'>{agent.name}</TableCell>
              <TableCell>
                {agent.workspace ? (
                  <Badge variant='secondary' className='font-normal'>
                    {agent.workspace}
                  </Badge>
                ) : (
                  <span className='text-muted-foreground'>-</span>
                )}
              </TableCell>
              <TableCell className='text-right font-mono'>
                {formatCurrency(agent.total_cost)}
              </TableCell>
              <TableCell className='text-right font-mono text-muted-foreground'>
                {formatNumber(agent.total_input_tokens)}
              </TableCell>
              <TableCell className='text-right font-mono text-muted-foreground'>
                {formatNumber(agent.total_output_tokens)}
              </TableCell>
              <TableCell className='text-right'>
                <Badge variant='outline'>{agent.session_count}</Badge>
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {formatRelativeTime(agent.created_at, locale)}
              </TableCell>
              <TableCell>
                <Link
                  to='/agents/$agentId'
                  params={{ agentId: agent.id }}
                  className='inline-flex'
                >
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <ExternalLink className='h-4 w-4' />
                    <span className='sr-only'>{text('查看详情', 'View details')}</span>
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

AgentsTable.displayName = 'AgentsTable'
