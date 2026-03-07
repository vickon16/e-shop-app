'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CreditCard,
  DollarSign,
  Download,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 dark space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full flex items-end justify-between px-4 pb-4 gap-2">
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors"
                style={{ height: '40%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $1,200
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Jan
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors"
                style={{ height: '65%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $3,100
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Feb
                </div>
              </div>
              <div
                className="w-full bg-primary rounded-t-md relative flex flex-col justify-end group hover:bg-primary/80 transition-colors"
                style={{ height: '100%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $5,200
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0 font-bold">
                  Mar
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors"
                style={{ height: '55%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $2,700
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Apr
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors"
                style={{ height: '80%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $4,100
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  May
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors"
                style={{ height: '45%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $1,900
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Jun
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors"
                style={{ height: '70%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $3,800
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Jul
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors hidden sm:flex"
                style={{ height: '85%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $4,500
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Aug
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors hidden md:flex"
                style={{ height: '60%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $2,900
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Sep
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors hidden lg:flex"
                style={{ height: '50%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $2,300
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Oct
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors hidden xl:flex"
                style={{ height: '90%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $4,800
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Nov
                </div>
              </div>
              <div
                className="w-full bg-primary/20 rounded-t-md relative flex flex-col justify-end group hover:bg-primary/40 transition-colors hidden xl:flex"
                style={{ height: '95%' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border shadow-sm text-xs py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                  $5,000
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-2 absolute -bottom-6 left-0 right-0">
                  Dec
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.martin@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$1,999.00</div>
              </div>
              <div className="flex items-center">
                <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$39.00</div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella Nguyen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.nguyen@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$299.00</div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>WK</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$99.00</div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>SD</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$39.00</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
