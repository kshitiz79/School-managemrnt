import React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'

const ErrorState = ({
  error,
  title,
  description,
  showRetry = true,
  showHome = false,
  showBack = false,
  onRetry,
  onHome,
  onBack,
  className,
  ...props
}) => {
  const getErrorMessage = () => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.response?.data?.message) return error.response.data.message
    return 'An unexpected error occurred'
  }

  const getErrorTitle = () => {
    if (title) return title
    if (error?.status === 404) return 'Page Not Found'
    if (error?.status === 403) return 'Access Denied'
    if (error?.status === 500) return 'Server Error'
    if (error?.status >= 400 && error?.status < 500) return 'Client Error'
    if (error?.status >= 500) return 'Server Error'
    return 'Something went wrong'
  }

  const getErrorDescription = () => {
    if (description) return description
    if (error?.status === 404)
      return 'The page you are looking for does not exist.'
    if (error?.status === 403)
      return 'You do not have permission to access this resource.'
    if (error?.status === 500)
      return 'The server encountered an error. Please try again later.'
    return getErrorMessage()
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 space-y-6',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-foreground">
          {getErrorTitle()}
        </h2>
        <p className="text-muted-foreground">{getErrorDescription()}</p>

        {error?.status && (
          <p className="text-sm text-muted-foreground">
            Error Code: {error.status}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="min-w-[120px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        {showHome && onHome && (
          <Button variant="outline" onClick={onHome} className="min-w-[120px]">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}

        {showBack && onBack && (
          <Button variant="outline" onClick={onBack} className="min-w-[120px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && error?.stack && (
        <details className="mt-6 w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Show Error Details
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs text-left overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

export default ErrorState
