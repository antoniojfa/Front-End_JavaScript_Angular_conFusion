export class Feedback {
    id: string = '';
    firstname: string = '';
    lastname: string = '';
    telnum!: number;
    email: string = '';
    agree: boolean = false;
    contacttype: string = '';
    message: string = '';
};

export const ContactType = ['None', 'Tel', 'Email'];