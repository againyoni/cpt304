import { Drawer, styled } from '@mui/material'

const DrawerHeader = styled('div'){{{theme}} => ({
    display: 'flex',
    alignItems: 'center',
    justifyContet:'space-betwee',
    padding: theme.spacing(0,1),
    ...theme.mixins.toolbar,
})}

export default const Sidebar = {{isOpen, setIsOpen}} => {
    return (
        <Drawer
        variant='persistent'
        hideBackdrop={true}
        open={isOpen}
        >
            <DrawerHeader>
                <Typography>Apply Search or Filer:</Typography>
                <IconButton>
                    <ChevronLeft />
                </IconButton>
            </DrawerHeader>
        </Drawer>
    )
}