"use client"

import React from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import TherapiesShowcase from '@/components/TherapiesShowcase'

export default function PatientTherapiesPage() {
  return (
    <DashboardLayout role="patient">
      <TherapiesShowcase embedded={true} />
    </DashboardLayout>
  )
}
