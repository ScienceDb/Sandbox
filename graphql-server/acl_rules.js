module.exports = {
    aclRules: [
        //administrator
        {
            roles: 'administrator',
            allows: [{
                resources: [
                    'role',
                    'user',
                    'role_to_user',
                ],
                permissions: '*'
            }]
        },

        // meta query
        {
            roles: 'reader',
            allows: [{
                resources: 'meta_query',
                permissions: '',
            }]
        },

        //models
        /**
         * Model: alien
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'alien',
                permissions: 'create'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'alien',
                permissions: 'search'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'alien',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'alien',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'alien',
                permissions: 'delete'
            }]
        },
        /**
         * Model: capital
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'capital',
                permissions: 'create'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'capital',
                permissions: 'search'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'capital',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'capital',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'capital',
                permissions: 'delete'
            }]
        },
        /**
         * Model: continent
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'continent',
                permissions: 'create'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'continent',
                permissions: 'search'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'continent',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'continent',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'continent',
                permissions: 'delete'
            }]
        },
        /**
         * Model: country
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'country',
                permissions: 'create'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'country',
                permissions: 'search'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'country',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'country',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'country',
                permissions: 'delete'
            }]
        },
        /**
         * Model: river
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'river',
                permissions: 'create'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'river',
                permissions: 'search'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'river',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'river',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'river',
                permissions: 'delete'
            }]
        },

        //adapters
    ]
}