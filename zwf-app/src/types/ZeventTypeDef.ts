import { ZeventDef } from "../entity/ZeventDef";
import { Role } from "./Role";

export enum ZeventType {
    TaskCreated = 'task-created',
    TaskCreatedByRecurringly = 'task-created-recurringly',
    TaskAssigned = 'task-assigned',
    TaskRenamed = 'task-renamed',
    TaskStatusToInProgress = 'task-status-started',
    TaskStatusCompleted = 'task-status-completed',
    TaskStatusArchived = 'task-status-archived',
    TaskStatusMovedBackToDo = 'task-moved-back-todo',
    TaskStatusAwaitClient = 'task-await-client',
    TaskFormSchemaChanged = 'task-form-schema-changed',
    TaskFieldValueChanged = 'task-field-value-changed',
    TaskAddedDoc = 'task-added-doc',
    TaskDeletedDoc = 'task-deleted-doc',
    TaskGenedDoc = 'task-gened-doc',
    RequestClientSignDoc = 'request-client-sign-doc',
    UnrequestClientSignDoc = 'unrequest-client-sign-doc',
    RequestClientFillForm = 'request-client-fill-form',
    ClientSignedDoc = 'client-signed-doc',
    ClientSubmittedForm = 'client-submitted-form',
    ClientDownloadedDoc = 'client-downloaded-doc',
    TaskComment = 'task-comment',
    SupportMessage = 'support-message',
}

export const ZEVENT_DEF_ENTITIES: ZeventDef[] = [
    {
        name: ZeventType.TaskCreated,
    },
    {
        name: ZeventType.TaskCreatedByRecurringly,
        notifyCenterRoles: [Role.Client, Role.Agent, Role.Admin],
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.TaskAssigned,
        notifyCenterRoles: [Role.Client, Role.Agent, Role.Admin],
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.TaskRenamed
    },
    {
        name: ZeventType.TaskStatusToInProgress,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        notifyCenterRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.TaskStatusCompleted,
        emailNotifyRoles: [Role.Client],
        notifyCenterRoles: [Role.Client],
    },
    {
        name: ZeventType.TaskStatusArchived,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        notifyCenterRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.TaskStatusAwaitClient,
        emailNotifyRoles: [Role.Client],
        notifyCenterRoles: [Role.Client],
    },
    {
        name: ZeventType.TaskStatusMovedBackToDo,
    },
    {
        name: ZeventType.TaskFormSchemaChanged,
    },
    {
        name: ZeventType.TaskFieldValueChanged,
        notifyCenterRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.TaskAddedDoc,
    },
    {
        name: ZeventType.TaskDeletedDoc,
    },
    {
        name: ZeventType.TaskGenedDoc,
    },
    {
        name: ZeventType.RequestClientSignDoc,
        emailNotifyRoles: [Role.Client],
        notifyCenterRoles: [Role.Client],
    },
    {
        name: ZeventType.UnrequestClientSignDoc,
        emailNotifyRoles: [Role.Client],
        notifyCenterRoles: [Role.Client],
    },
    {
        name: ZeventType.RequestClientFillForm,
        emailNotifyRoles: [Role.Client],
        notifyCenterRoles: [Role.Client],
    },
    {
        name: ZeventType.ClientSignedDoc,
        emailNotifyRoles: [Role.Agent, Role.Admin],
        notifyCenterRoles: [Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.ClientSubmittedForm,
        emailNotifyRoles: [Role.Agent, Role.Admin],
        notifyCenterRoles: [Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.ClientDownloadedDoc,
    },
    {
        name: ZeventType.TaskComment,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        notifyCenterRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventType.SupportMessage,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin, Role.System],
        notifyCenterRoles: [Role.Client, Role.Agent, Role.Admin, Role.System],
    },
];

export const ZeventTypeDefMap = ZEVENT_DEF_ENTITIES.reduce((pre, cur) => {
    pre[cur.name] = cur;
    return pre;
}, {}) as Record<string, ZeventDef>