import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {JwtHelperService} from '@auth0/angular-jwt';
import {TwoFactorServiceProvider} from '../../../services/twofactor/twofactor-service-provider';
import {UserServiceProvider} from '../../../services/users/user-service-provider';
import {MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-two-factor-dialog',
    templateUrl: './two-factor-check-dialog.component.html',
    styleUrls: ['./two-factor-check-dialog.component.scss']
})

export class TwoFactorCheckDialogComponent {
    user;
    twoFactorType;
    twoFactorForm = this.fb.group({
        token: [null, [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
    loading = false;
    private jwtHelper = new JwtHelperService();

    constructor(private fb: FormBuilder,
                private snackBar: MatSnackBar,
                private twoFactorServiceProvider: TwoFactorServiceProvider,
                private userServiceProvider: UserServiceProvider,
                public twoFactorDialog: MatDialogRef<TwoFactorCheckDialogComponent>) {
        this.user = this.jwtHelper.decodeToken(this.userServiceProvider.default().getJwtToken()).user;
        if (this.user.twoFactorApp) {
            this.twoFactorType = 'app';
        } else if (this.user.twoFactorSms) {
            this.sendTokenBySms();
        }
    }

    onSubmit(): void {
        if (this.twoFactorForm.invalid) {
            return;
        }
        this.loading = true;
        switch (this.twoFactorType) {
            case 'app':
                this.twoFactorServiceProvider.default().verifyTokenByApp(this.user.secret,
                    this.twoFactorForm.get('token').value).toPromise().then(() => {
                    this.loading = false;
                    this.twoFactorDialog.close(true);
                }).catch(err => {
                    this.loading = false;
                    if (err.status === 403) {
                        this.snackBar.open(err.error.msg, null, {duration: 2500});
                    } else {
                        throw(err);
                    }
                });
                break;
            case 'sms':
                this.twoFactorServiceProvider.default().verifyTokenBySms(this.user.phoneNumber,
                    this.twoFactorForm.get('token').value).toPromise().then(() => {
                    this.loading = false;
                    this.twoFactorDialog.close(true);
                }).catch(err => {
                    this.loading = false;
                    if (err.status === 403) {
                        this.snackBar.open(err.error.msg, null, {duration: 2500});
                    } else {
                        throw(err);
                    }
                });
                break;
        }
    }

    sendTokenBySms(): void {
        this.twoFactorType = 'sms';
        this.twoFactorServiceProvider.default().sendTokenBySms(this.user.phoneNumber).toPromise()
            .catch(err => this.snackBar.open('SMS cannot be sent : ' + err.error.msg, null, {duration: 2500}));
    }
}