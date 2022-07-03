export enum Role {
    System = 'system',  // Highest permission
    Admin = 'admin',    // Org admin (root user)
    Agent = 'agent',    // Org member
    AdminExpired = 'admin_expired', // Org admin without alive subscription
    AgentExpired= 'agent_expired', // Org member without alive subscription
    Client = 'client',  // Client
    Guest = 'guest'     // Anonymous user
}

