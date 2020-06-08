import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import cn from 'classnames'
import classes from './Navbar.module.css'

const ITEMS = [
  { to: '/crafts', code: 'Nos crafts' },
  { to: '/jobs', code: 'Nos métiers' },
]

const Navbar = () => {
  const { pathname } = useLocation()

  return (
    <div className={cn('navbar', classes.navbar)}>
      <img className={cn('logo', classes.logo)} src="/logo.png" alt="logo" />

      {ITEMS.map(({ to, code }) => (
        <Link
          to={to}
          className={cn('item', classes.item, {
            [classes.selected]: pathname.startsWith(to),
          })}
          key={to}
        >
          {code}
        </Link>
      ))}
    </div>
  )
}

export default Navbar
