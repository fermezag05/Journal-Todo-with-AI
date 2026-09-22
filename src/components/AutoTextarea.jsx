import { useLayoutEffect, useRef } from 'react'

// Textarea that grows with its content.
export default function AutoTextarea({ value, minRows = 3, ...props }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return <textarea ref={ref} value={value} rows={minRows} {...props} />
}
