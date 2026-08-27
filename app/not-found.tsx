import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-6xl">🗺️</div>
          <CardTitle>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#6B6460]">
            Sorry, we couldn't find the page you're looking for.
          </p>

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button className="w-full">Go Home</Button>
            </Link>
            <Link href="/trips" className="flex-1">
              <Button variant="outline" className="w-full">
                My Trips
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
