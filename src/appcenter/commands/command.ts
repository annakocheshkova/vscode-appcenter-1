import { ExtensionManager } from "../../extensionManager";
import { Profile } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Strings } from "../../helpers/strings";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger, LogLevel } from "../../log/logHelper";
import { AppCenterClient, AppCenterClientFactory, createAppCenterClient } from "../api";
import Auth from "../auth/auth";

export class Command {

    protected clientFactory: AppCenterClientFactory;
    private client: AppCenterClient;

    constructor(protected manager: ExtensionManager, protected logger: ILogger) {
        this.clientFactory = createAppCenterClient();
    }

    public runNoClient(): Promise<void> {
        const rootPath: string | undefined = this.manager.projectRootPath;
        if (!rootPath) {
            this.logger.log('No project root path found', LogLevel.Error);
            return Promise.resolve(void 0);
        }
        return Promise.resolve(void 0);
    }

    public async run(): Promise<void> {
        const rootPath: string | undefined = this.manager.projectRootPath;
        if (!rootPath) {
            this.logger.log('No project root path found', LogLevel.Error);
            return Promise.resolve(void 0);
        }

        return Auth.getProfile(<string>this.manager.projectRootPath).then((profile: Profile) => {
            if (!profile) {
                VsCodeUtils.ShowWarningMessage(Strings.UserIsNotLoggedInMsg);
                return Promise.resolve(void 0);
            } else {
                const clientOrNull: AppCenterClient | null  = this.resolveAppCenterClient(profile);
                if (clientOrNull) {
                    this.client = clientOrNull;
                } else {
                    this.logger.log("Failed to get App Center client", LogLevel.Error);
                }
                return Promise.resolve(void 0);
            }
         });
    }

    private resolveAppCenterClient(profile: Profile): AppCenterClient | null {
        if (!this.client) {
            if (profile) {
                return this.clientFactory.fromProfile(profile, SettingsHelper.getAppCenterAPIEndpoint());
            } else {
                this.logger.log('No App Center user specified!', LogLevel.Error);
                return null;
            }
        }
        return this.client;
    }
}
