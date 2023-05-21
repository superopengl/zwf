import { ZeventDef } from "../entity/ZeventDef";
import { Role } from "./Role";
import { ZeventName } from "./ZeventName";

export const ZEVENT_DEF_ENTITIES: ZeventDef[] = [
    {
        name: ZeventName.TaskCreated,
    },
    {
        name: ZeventName.TaskCreatedByRecurringly,
        uiNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.TaskAssigned,
        uiNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.TaskRenamed
    },
    {
        name: ZeventName.TaskStatusToInProgress,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        uiNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.TaskStatusCompleted,
        emailNotifyRoles: [Role.Client],
        uiNotifyRoles: [Role.Client],
    },
    {
        name: ZeventName.TaskStatusArchived,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        uiNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.TaskStatusAwaitClient,
        emailNotifyRoles: [Role.Client],
        uiNotifyRoles: [Role.Client],
    },
    {
        name: ZeventName.TaskStatusMovedBackToDo,
    },
    {
        name: ZeventName.TaskFormSchemaChanged,
    },
    {
        name: ZeventName.TaskFieldValueChanged,
        uiNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.TaskAddedDoc,
    },
    {
        name: ZeventName.TaskDeletedDoc,
    },
    {
        name: ZeventName.TaskGenedDoc,
    },
    {
        name: ZeventName.RequestClientSignDoc,
        emailNotifyRoles: [Role.Client],
        uiNotifyRoles: [Role.Client],
    },
    {
        name: ZeventName.UnrequestClientSignDoc,
        emailNotifyRoles: [Role.Client],
        uiNotifyRoles: [Role.Client],
    },
    {
        name: ZeventName.RequestClientFillForm,
        emailNotifyRoles: [Role.Client],
        uiNotifyRoles: [Role.Client],
    },
    {
        name: ZeventName.ClientSignedDoc,
        emailNotifyRoles: [Role.Agent, Role.Admin],
        uiNotifyRoles: [Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.ClientSubmittedForm,
        emailNotifyRoles: [Role.Agent, Role.Admin],
        uiNotifyRoles: [Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.ClientDownloadedDoc,
    },
    {
        name: ZeventName.TaskComment,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
        uiNotifyRoles: [Role.Client, Role.Agent, Role.Admin],
    },
    {
        name: ZeventName.SupportMessage,
        emailNotifyRoles: [Role.Client, Role.Agent, Role.Admin, Role.System],
        uiNotifyRoles: [Role.Client, Role.Agent, Role.Admin, Role.System],
    },
];

export const ZEVENT_DEF_MAP = ZEVENT_DEF_ENTITIES.reduce((pre, cur) => {
    pre[cur.name] = cur;
    return pre;
}, {}) as Record<string, ZeventDef>