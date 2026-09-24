import { useState, useEffect } from 'react'
import { Satellite, Sun, Moon, Grid, Bell } from 'lucide-react'
import styles from './Header.module.css'

export default function Header() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Satellite size={20} className={styles.logoIcon} strokeWidth={2.5} />
        <h1 className={styles.logoText}>GeoGuard Ai</h1>
        <span className={styles.tag}>SNN_V3</span>
      </div>

      <div className={styles.status}>
        <div className={styles.dot}></div>
        SYSTEM_OPERATIONAL
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
        </button>
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  )
}
