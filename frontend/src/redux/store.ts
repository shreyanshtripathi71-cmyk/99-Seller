import { configureStore } from '@reduxjs/toolkit'
import leadSlice from './features/leadSlice'

const store = configureStore({
   reducer: {
      lead: leadSlice, 
   
   },
   middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
   }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store