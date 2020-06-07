import React from 'react'
import { Link } from 'react-router-dom'
import cn from 'classnames'
import classes from './Navbar.module.css'

const Navbar = () => {
  return (
    <div className={cn('navbar', classes.navbar)}>
      <img className={cn('logo', classes.logo)} src="/logo.png" alt="logo" />
      <Link to="/jobs" className={cn('item', classes.item)}>
        Nos métiers
      </Link>
      <Link to="/crafts" className={cn('item', classes.item)}>
        Nos crafts
      </Link>
    </div>
  )
}

export default Navbar
