export const NAV_ITEMS = [
  { label: 'Admin Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['ADMIN'] },
  { label: 'User Management', href: '/dashboard', icon: 'Users', roles: ['ADMIN'] },
  { label: 'Course Catalog', href: '/courses', icon: 'BookOpen', roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'] },
  { label: 'Trainer Portal', href: '/courses', icon: 'GraduationCap', roles: ['INSTRUCTOR', 'ADMIN'] },
  { label: 'Learning Path', href: '/courses', icon: 'Route', roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
  { label: 'Settings', href: '/dashboard', icon: 'Settings', roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'] },
]

export const COURSE_HEADER_COLORS = [
  'bg-[#2D3E6B]',
  'bg-[#1B5E4B]',
  'bg-xebia-velvet',
  'bg-[#533754]',
  'bg-xebia-velvet-dark',
  'bg-[#793874]',
]

export const STATUS_FILTERS = ['All', 'Active', 'Draft', 'Archived']
