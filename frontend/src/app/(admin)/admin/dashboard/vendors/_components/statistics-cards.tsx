import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Clock, XCircle, DollarSign, ShoppingCart } from "lucide-react"

interface StatisticsCardsProps {
  statistics: {
    active: number
    pending: number
    rejected: number
    suspended: number
  }
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const {active , pending , rejected , suspended} = statistics;

  const total = active + pending + rejected + suspended;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            {statistics.active} active, {statistics.pending} pending, {statistics.rejected} rejected, {statistics.suspended || 0} suspended
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.active}</div>
          <div className="flex items-center pt-1">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${(statistics.active / total) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-muted-foreground">
              {Math.round((statistics.active / total) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.pending}</div>
          <div className="flex items-center pt-1">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-yellow-500"
                style={{ width: `${(statistics.pending / total) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-muted-foreground">
              {Math.round((statistics.pending / total) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Vendors</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>          
          <div className="text-2xl font-bold">{statistics.rejected + statistics.suspended}</div>
          <div className="flex items-center pt-1">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-red-500"
                style={{ width: `${(statistics.rejected + statistics.suspended /total) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-muted-foreground">
              {Math.round((statistics.rejected + statistics.suspended / total) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

     


   
    </div>
  )
}
