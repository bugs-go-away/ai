import React, { useEffect, useState }  from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

export default function ChatSidebarContainer({ open, toggleSidebar}) {

	const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleSidebar(false)}>
      <List>
        {['Bot1', 'Bot2', 'Bot3', 'Bot4'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

	return (
		<div>
			<Drawer open={open} onClose={toggleSidebar(false)}>
        {DrawerList}
      </Drawer>
		</div>
	)
}