import { useTypewriter } from '@/hooks/useTypewriter'
import styles from '@/styles/agent.module.css'

export default function ChatMessage({ message, sender, severity }) {
  const isAgent = sender === 'agent'
  const validMessage = message || ''
  const { displayed, isDone } = useTypewriter(isAgent ? validMessage : null, 15)

  const content = isAgent ? displayed : validMessage

  return (
    <div className={`${styles.messageWrapper} ${isAgent ? styles.agent : styles.user}`}>
      <div className={styles.messageHeader}>
        {isAgent ? 'Agent' : 'You'}
      </div>
      <div className={`${styles.bubble} ${isAgent && severity ? styles[severity] : ''}`}>
        {content}
        {isAgent && !isDone && <span className={styles.cursor}>▋</span>}
      </div>
    </div>
  )
}
