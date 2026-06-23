import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

export async function getCourses() {
  const { data } = await api.get('/courses')
  return data.data || []
}

export async function getCourseById(id) {
  const { data } = await api.get(`/courses/${id}`)
  return data.data
}

export async function getCategories() {
  const { data } = await api.get('/categories')
  return data.data || []
}

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return fallback
}
