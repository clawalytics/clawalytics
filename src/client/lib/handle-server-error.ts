import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { translateStatic } from '@/context/locale-provider'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg = translateStatic('发生了一些问题。', 'Something went wrong!')

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = translateStatic('未找到内容。', 'Content not found.')
  }

  if (error instanceof AxiosError) {
    errMsg = error.response?.data.title
  }

  toast.error(errMsg)
}
