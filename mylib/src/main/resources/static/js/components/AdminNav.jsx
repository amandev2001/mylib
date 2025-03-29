import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Box
} from '@mui/material';
import {
    LockReset as LockResetIcon,
    People as PeopleIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';

const AdminNav = () => {
    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <List component="nav">
                <ListItemButton component={RouterLink} to="/admin/users">
                    <ListItemIcon>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Manage Users" />
                </ListItemButton>

                <ListItemButton component={RouterLink} to="/admin/reset-password">
                    <ListItemIcon>
                        <LockResetIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reset Passwords" />
                </ListItemButton>

                <Divider />

                <ListItemButton component={RouterLink} to="/admin/settings">
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="System Settings" />
                </ListItemButton>
            </List>
        </Box>
    );
};

export default AdminNav; 