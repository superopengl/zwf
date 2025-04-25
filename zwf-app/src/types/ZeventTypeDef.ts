
export enum ZeventType {
    Created = 'created',
    CreatedByRecurring = 'created-recurringly',
    Assign = 'assign',
    Rename = 'rename',
    ClientSignDoc = 'client-sign-doc',
    OrgStartProceed = 'start-proceeding',
    RequestClientSign = 'request-client-sign',
    UnrequestClientSign = 'unrequest-client-sign',
    RequestClientInputForm = 'request-client-fill-form',
    ClientSubmitForm = 'client-submit-form',
    ClientDownloadDoc = 'client-download-doc',
    Complete = 'complete',
    Archive = 'archive',
    MoveBackToDo = 'move-back-to-do',
    FieldSchemaChange = 'field-schema-change',
    FieldValuesChange = 'field-value-change',
    AddDoc = 'add-doc',
    DeleteDoc = 'delete-doc',
    GenDoc = 'gen-doc',
    Comment = 'task-comment',
    SupportMessage = 'support-message',
}

type TaskEventDefContent = {
    notifyEmitter?: boolean,
    notifyClientWatcher?: boolean,
    notifyOrgWatcher?: boolean,
    notifyOrg?: boolean,
    notifySystem?: boolean,
}

export const ZeventTypeDef: Record<string, TaskEventDefContent> = {
    [ZeventType.Created]: {
    },
    [ZeventType.CreatedByRecurring]: {
        notifyOrg: true,
    },
    [ZeventType.Assign]: {
        notifyOrgWatcher: true,
        notifyClientWatcher: true,
    },
    [ZeventType.Rename]: {
    },
    [ZeventType.ClientSignDoc]: {
        notifyOrgWatcher: true,
    },
    [ZeventType.OrgStartProceed]: {
    },
    [ZeventType.RequestClientSign]: {
        notifyClientWatcher: true,
    },
    [ZeventType.UnrequestClientSign]: {
        notifyClientWatcher: true,
    },
    [ZeventType.RequestClientInputForm]: {
        notifyClientWatcher: true,
    },
    [ZeventType.ClientSubmitForm]: {
        notifyOrgWatcher: true,
    },
    [ZeventType.ClientDownloadDoc]: {
    },
    [ZeventType.Complete]: {
        notifyOrgWatcher: true,
    },
    [ZeventType.Archive]: {
        notifyOrgWatcher: true,
    },
    [ZeventType.MoveBackToDo]: {
    },
    [ZeventType.FieldSchemaChange]: {
    },
    [ZeventType.FieldValuesChange]: {
    },
    [ZeventType.AddDoc]: {
    },
    [ZeventType.DeleteDoc]: {
    },
    [ZeventType.GenDoc]: {
    },
    [ZeventType.Comment]: {
        notifyEmitter: true,
        notifyOrgWatcher: true,
        notifyClientWatcher: true,
    },
    [ZeventType.SupportMessage]: {
        notifyEmitter: true,
        notifySystem: true,
    },
}