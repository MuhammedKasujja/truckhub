import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabs = ['bookings','rides','payments', 'clients', 'drivers', 'vehicles', 'users' ] as const

export function EntityNumbersWrapper() {
  return (
    <Tabs defaultValue={tabs[0]}>
      <TabsList>
        {tabs.map((tab, index) => (
          <TabsTrigger key={`entity.${index}.${tab}`} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="bookings"></TabsContent>
      <TabsContent value="rides"></TabsContent>
      <TabsContent value="payments"></TabsContent>
      <TabsContent value="clients"></TabsContent>
      <TabsContent value="drivers"></TabsContent>
      <TabsContent value="vehicles"></TabsContent>
      <TabsContent value="users"></TabsContent>
    </Tabs>
  )
}
