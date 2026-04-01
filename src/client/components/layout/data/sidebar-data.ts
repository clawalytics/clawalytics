import { DollarSign, HelpCircle, Wallet } from 'lucide-react'
import { HomeIcon } from '@/components/icons/home-icon'
import { SessionsIcon } from '@/components/icons/sessions-icon'
import { SecurityIcon } from '@/components/icons/security-icon'
import { ToolsIcon } from '@/components/icons/tools-icon'
import { type SidebarData } from '../types'

export function getSidebarData(
  text: (zh: string, en: string) => string
): SidebarData {
  return {
    teams: [
      {
        name: 'Clawalytics',
        logo: DollarSign,
        plan: text('OpenClaw 数据分析', 'OpenClaw Analytics'),
      },
    ],
    navGroups: [
      {
        title: text('分析', 'Analytics'),
        items: [
          {
            title: text('仪表盘', 'Dashboard'),
            url: '/',
            icon: HomeIcon,
          },
          {
            title: text('会话', 'Sessions'),
            url: '/sessions',
            icon: SessionsIcon,
          },
          {
            title: text('工具', 'Tools'),
            url: '/tools',
            icon: ToolsIcon,
          },
          {
            title: text('预算', 'Budget'),
            url: '/budget',
            icon: Wallet,
          },
        ],
      },
      {
        title: text('安全', 'Security'),
        items: [
          {
            title: text('安全中心', 'Security'),
            url: '/security',
            icon: SecurityIcon,
          },
        ],
      },
      {
        title: text('帮助', 'Help'),
        items: [
          {
            title: text('帮助中心', 'Help Center'),
            url: '/help-center',
            icon: HelpCircle,
          },
        ],
      },
    ],
  }
}
