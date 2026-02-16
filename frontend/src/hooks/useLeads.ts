import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeads, Lead } from '@/redux/features/leadSlice'
import type { RootState, AppDispatch } from '@/redux/store'

type UseLeadsReturn = {
  leads: Lead[]
  loading: boolean
}

const useLeads = (): UseLeadsReturn => {
  const dispatch = useDispatch<AppDispatch>()
  const leads = useSelector((state: RootState) => state.lead.leads)
  const loading = useSelector((state: RootState) => state.lead.loading)

  useEffect(() => {
    // Fetch leads once if not present
    if (!leads || leads.length === 0) {
      dispatch(fetchLeads())
    }
  }, [dispatch])

  return { leads: leads || [], loading: !!loading }
}

export default useLeads