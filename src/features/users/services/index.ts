import {
  UserCreateSchema,
  UserUpdateSchema,
  UserSearchParamsCache,
  UserAssignRolesSchema,
} from "@/features/users/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getUsers,
  createUser,
  updateUser,
  getUserById,
  deleteUserById,
  getUsersByQuery,
  userAssignRoles,
  getUserProfileById,
} from "./server"
import { ApiError } from "@/types"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getUsersFn = createServerFn()
  .validator(UserSearchParamsCache)
  .handler(async ({ data: query }) => {
    const { data, pagination, error } = await getUsers(query)
    if (error) {
      const { message, erroCode, statusCode } = error
      throw new ApiError(message, statusCode, erroCode)
    }

    return { data, pagination }
  })

export const getUsersByQueryFn = createServerFn()
  .validator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getUsersByQuery(data)
  })

export const getUserDetailsFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(getUserById(data.id))
  })

export const getUserProfileDetailsFn = createServerFn().handler(async () => {
  return apiResponseTransform(getUserProfileById())
})

export const deleteUserFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteUserById(data.id)
  })

export const updateUserFn = createServerFn({ method: "POST" })
  .validator(UserUpdateSchema)
  .handler(async ({ data }) => {
    return updateUser(data)
  })

export const createUserFn = createServerFn({ method: "POST" })
  .validator(UserCreateSchema)
  .handler(async ({ data }) => {
    return createUser(data)
  })

export const userAssignRolesFn = createServerFn({ method: "POST" })
  .validator(UserAssignRolesSchema)
  .handler(({ data }) => {
    return userAssignRoles(data)
  })
