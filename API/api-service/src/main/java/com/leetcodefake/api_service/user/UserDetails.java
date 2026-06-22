package com.leetcodefake.api_service.user;

import com.leetcodefake.api_service.common.enums.Role;

public interface UserDetails {
    String getUsername();
    Role getAuthority();
}
