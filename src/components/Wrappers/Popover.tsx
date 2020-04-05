import React from 'react'
import Popover from 'react-awesome-popover'
import './Popover.scss'

const WrappedPopover = (rest: Popover.PopoverProps) => (
  <Popover
    data-html2canvas-ignore
    className="nl-popover"
    overlayColor="none"
    arrowProps={{ className: 'd-none' }}
    {...rest}
  />
)

export default WrappedPopover
