import * as typeOrm from 'typeorm';

/**
 * The Roles that can be assigned to users
 */
@typeOrm.Entity("role")
export class Role extends typeOrm.BaseEntity {

    static publish = 'Publish';
    static edit = 'Edit';
    static write = 'Write';
    static addUser = 'Add-User';
    static read = 'Read';
    static comment = 'Comment';

    /**
     * @property {number} id - The Role Table Id.
     */
    @typeOrm.PrimaryGeneratedColumn()
    id: number;

    /**
     * @property {string} type - The Role name.
     */
    @typeOrm.Column({unique: true})
    type: string;

    /**
     * @property {string[]} permissions - An Array of allowed action. The valid actions
     *                                    are 'Publish', 'Write', 'Edit', 'Add User', 'Read'.
     */
    @typeOrm.Column("varchar", { isArray: true, length: 20 })
    permissions: string[];

    /**
     * @property {Date} updatedAt - The last update date & time.
     */
    @typeOrm.UpdateDateColumn()
    updatedAt: Date;

    /**
     * @property {Date} createdAt - The date & time the entry was created at.
     */
    @typeOrm.CreateDateColumn()
    createdAt: Date;


    /**
     * Add given Permisson to the Permissions array property
     * 
     * @param {string} permission 
     * @returns {this}
     */
    public can(permission: string): this {
        this.permissions.push(permission);
        return this;
    }

    /**
     * Add Read permission
     */
    public canRead(): this {
        this.permissions.push(Role.read);
        return this;
    }

    /**
     * Add Write permission
     */
    public canWrite(): this {
        this.permissions.push(Role.write);
        return this;
    }

    /**
     * Add Edit permission
     */
    public canEdit(): this {
        this.permissions.push(Role.edit);
        return this;
    }

    /**
     * Add Publish permission
     */
    public canPublish(): this {
        this.permissions.push(Role.publish);
        return this;
    }

    /**
     * Add 'Add-User' permission
     */
    public canAddUser(): this {
        this.permissions.push(Role.addUser);
        return this;
    }

    /**
     * Add Comment permission
     */
    public canComment(): this {
        this.permissions.push(Role.comment);
        return this;
    }
}