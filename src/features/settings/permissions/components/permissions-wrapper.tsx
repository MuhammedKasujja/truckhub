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
import { SystemPermissions } from "@/features/auth/permissions"
import { assignPermissionsToRoleFn } from "@/features/settings/permissions/services"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { Can } from "@/components/has-permission"
import { Badge } from "@/components/ui/badge"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from "@/i18n"
import { Checkbox } from "@/components/ui/checkbox"

export function PermissionsWrapper() {
  const { data } = useQuery(createRolesQueryOptions())
  const tr = useTranslation()

  const [_, setPermissionCount] = useState<Map<string, number>>(new Map())

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  )
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())

  function handleModulePermission(
    permissions: Record<string, readonly string[]>,
    checked: boolean
  ) {
    const modules = Object.keys(permissions)
    const permissionList = Object.values(permissions).flat()
    if (checked) {
      setSelectedModules((prev) => {
        const next = new Set(prev)
        modules.forEach((item) => next.add(item))
        return next
      })
    } else {
      setSelectedModules((prev) => {
        const next = new Set(prev)
        modules.forEach((item) => next.delete(item))
        return next
      })
    }
    togglePermissions(permissionList)
  }

  const [roleId, setRoleId] = useState<string | undefined>()

  const groupedPermissions = useMemo(
    () => Object.entries(SystemPermissions),
    []
  )

  const isAllSelected = (permissions: string[]) =>
    permissions.every((p) => selectedPermissions.has(p))

  const isModuleSelected = (modules: string[]) =>
    modules.every((p) => selectedModules.has(p))

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

  function handleRoleChanged(roleId: string) {
    setRoleId(roleId)
    const selectedRole = (data ?? []).find((role) => role.id === roleId)
    if (selectedRole) {
      setSelectedPermissions(new Set<string>(selectedRole.permissions))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-5">
        <Select value={roleId} onValueChange={handleRoleChanged}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(data ?? []).map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Can permission="config:roles:assign_permissions">
          <Button type="button" onClick={() => saveRolePermissions()}>
            {tr("permissions.apply_permissions")}
          </Button>
        </Can>
      </div>
      {groupedPermissions.map(([module, permissions]) => (
        <Card key={module}>
          <CardHeader>
            <CardTitle>{tr(`permissions.modules.${module}`)}</CardTitle>
            <CardAction>
              <Checkbox
                checked={isModuleSelected(Object.keys(permissions))}
                onCheckedChange={(checked: boolean) => {
                  handleModulePermission(permissions, checked)
                }}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(permissions).map(([group, permissionList]) => (
              <Button
                type="button"
                variant={isAllSelected(permissionList) ? "outline" : "ghost"}
                key={group}
                onClick={() => togglePermissions(permissionList)}
              >
                {group}
              </Button>
            ))}
          </CardContent>
        </Card>
      ))}
      {[...selectedPermissions].map((perm) => (
        <Badge key={perm} variant={"outline"} className="mr-1">
          {perm}
        </Badge>
      ))}
    </div>
  )
}
