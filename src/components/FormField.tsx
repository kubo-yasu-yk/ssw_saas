import React from 'react'

type Props = {
  label: string
  error?: string
  children: React.ReactNode
}

const FormField: React.FC<Props> = ({ label, error, children }) => (
  <label className="block mb-3">
    <div className="mb-1 text-sm text-gray-700">{label}</div>
    {children}
    {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
  </label>
)

export default FormField

