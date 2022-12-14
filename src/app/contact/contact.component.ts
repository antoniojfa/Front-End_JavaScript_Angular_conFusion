import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlConfig, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { FeedbackService } from '../services/feedback.service';
import { flyInOut, expand } from '../animations/app.animation';

interface validationMessages {
  firstname: {
    required: string,
    minlength: string,
    maxlength: string
  },
  lastname: {
    required: string,
    minlength: string,
    maxlength: string
  },
  telnum: {
    required: string,
    pattern: string
  },
  email: {
    required: string,
    email: string
  }
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    flyInOut(),
    expand()
  ]
})

export class ContactComponent implements OnInit {

  feedbackForm!: FormGroup;
  feedback: Feedback | undefined;
  feedbackcopy!: Feedback;
  feedbackIds: string[] | any;
  errMess: string = '';
  showSubmission: boolean = false;
  contactType = ContactType;
  @ViewChild('fform') feedbackFormDirective: any;

  temp: string = '';

  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  }

  validationMessage: validationMessages = {
    'firstname': {
      'required': 'First name is required.',
      'minlength': 'First name must be at least 2 characters long',
      'maxlength': 'First name cannot be more than 25 characters long'
    },
    'lastname': {
      'required': 'Last name is required.',
      'minlength': 'Last name must be at least 2 characters long',
      'maxlength': 'Last name cannot be more than 25 characters long'
    },
    'telnum': {
      'required': 'Tel. number is required.',
      'pattern': 'Tel. number must contain only numbers.'
    },
    'email': {
      'required': 'Email is required.',
      'email': 'Email not in the valid format.'
    }
  }

  feedbackEmpty: Feedback = {
    id: '',
    firstname: '',
    lastname: '',
    telnum: 0,
    email: '',
    agree: false,
    contacttype: 'None',
    message: ''
  }

  constructor(private fb: FormBuilder,
      private feedbackService: FeedbackService) {
    this.createForm();
   }

  ngOnInit(): void {
    this.feedbackService.getFeedbackIds()
      .subscribe(feedbackIds => this.feedbackIds = feedbackIds);
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      id: '',
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [null, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }

    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field as keyof typeof this.formErrors] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessage[field as keyof validationMessages];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field as keyof typeof this.formErrors] += messages[key as keyof typeof messages] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit(){
    this.feedbackcopy = this.feedbackForm.value;
    this.feedbackcopy.id = this.feedbackIds?.length + 1;
    this.feedbackService.submitFeedback(this.feedbackcopy)
      .subscribe(feedback => {
        this.feedback = feedback; this.feedbackcopy = feedback;
      },
      errmess => {
        this.feedback = undefined; this.errMess = <any>errmess
      });
    this.showSubmission = true;
    console.log(this.feedbackcopy);
    setTimeout(() => this.clearForm(), 5000);
    
  }

  clearForm() {
    this.feedback = undefined;
    this.showSubmission = false;
    this.feedbackForm.reset({
      id: '',
      firstname: '',
      lastname: '',
      telnum: null,
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.feedbackFormDirective.resetForm();
  }



}