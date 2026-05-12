"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemPermissions } from "@/features/auth/permissions"
import { assignPermissionsToRoleFn } from "@/features/settings/permissions/services"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { EditRoleDialog } from "./edit-role-modal"
import { Can } from "@/components/has-permission"
import { useQuery } from "@tanstack/react-query"
import { createRolesListQueryOptions } from "../query-options"

const modules = Object.keys(SystemPermissions)

export function PermissionsWrapper() {
  const { data } = useQuery(createRolesListQueryOptions())

  const [_, setPermissionCount] = useState<Map<string, number>>(new Map())

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  )
  const [roleId, setRoleId] = useState<string | undefined>()

  const groupedPermissions = useMemo(
    () => Object.entries(SystemPermissions),
    []
  )

  const isAllSelected = (permissions: string[]) =>
    permissions.every((p) => selectedPermissions.has(p))

  const togglePermissions = (permissions: string[]) => {
    setPermissionCount((prev) => {
      // 1️⃣ Create a copy (immutability for React state)
      const next = new Map(prev)

      // 2️⃣ Check if ALL permissions in this group are currently selected
      const allSelected = permissions.every((p) => next.get(p))

      // 3️⃣ Loop through each permission in the group
      permissions.forEach((p) => {
        // 4️⃣ Get current count (how many groups added this permission)
        const count = next.get(p) || 0

        if (allSelected) {
          // 5️⃣ If group is already fully selected → we REMOVE it

          // decrement logic
          if (count <= 1) {
            // 6️⃣ If this was the only group contributing this permission
            // → completely remove it
            next.delete(p)
          } else {
            // 7️⃣ Otherwise, just reduce its count
            next.set(p, count - 1)
          }
        } else {
          // 8️⃣ If group is NOT fully selected → we ADD it

          // increment count (track another group using it)
          next.set(p, count + 1)
        }
      })

      // 9️⃣ Sync the Set with current active permissions
      // Map keys = permissions that still have count > 0
      setSelectedPermissions(new Set(next.keys()))

      // 🔟 Return updated Map (React state update)
      return next
    })
  }

  async function saveRolePermissions() {
    if (!roleId) {
      toast.error("Please select a role")
      return
    }
    const { error, isSuccess } = await assignPermissionsToRoleFn({
      data: {
        roleId,
        permissions: [...selectedPermissions],
      },
    })

    if (isSuccess) {
      toast.success("Permissions successfully assigned roles")
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-5">
        <Select
          value={roleId}
          onValueChange={(role) => {
            setRoleId(role)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(data?.data ?? []).map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Can permission={"config:create:role"}>
          <EditRoleDialog />
        </Can>
        <Button type="button" onClick={() => saveRolePermissions()}>
          Sync Permissions
        </Button>
      </div>
      <Tabs defaultValue={modules[0]} className="w-full">
        <TabsList>
          {modules.map((module) => (
            <TabsTrigger key={module} value={module}>
              {module}
            </TabsTrigger>
          ))}
        </TabsList>
        {groupedPermissions.map(([module, permissions]) => (
          <TabsContent value={module} key={module}>
            {Object.entries(permissions).map(([group, permissionList]) => (
              <Button
                type="button"
                variant={isAllSelected(permissionList) ? "default" : "ghost"}
                key={group}
                onClick={() => togglePermissions(permissionList)}
              >
                {group}
              </Button>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      {selectedPermissions}
    </div>
  )
}
