import { Component, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Comment } from '../shared/comment';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { ControlConfig, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { baseURL } from '../shared/baseurl';

interface validationMessages {
  author: {
    required: string,
    minlength: string,
    maxlength: string
  },
  comment: {
    required: string
  }
}

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish | undefined;
  dishcopy!: Dish;
  errMess: string = '';
  dishIds: string[] | any;
  prev: string = '';
  next: string = '';
  starts: number = 5;

  BaseURL = baseURL;

  commentForm!: FormGroup;
  commentUser!: Comment;

  @ViewChild('fform') commentFormDirective: any;

  formErrors = {
    'author': '',
    'comment': ''
  }

  validationMessage: validationMessages = {
    'author': {
      'required': 'Name is required.',
      'minlength': 'Name must be at least 2 characters long',
      'maxlength': 'Name cannot be more than 25 characters long'
    },
    'comment': {
      'required': 'Comment is required.'
    }
  }

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {
      this.createForm();
    }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess );
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds?.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds?.length + index - 1) % this.dishIds?.length];
    this.next = this.dishIds[(this.dishIds?.length + index + 1) % this.dishIds?.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: 5,
      comment: ['', Validators.required]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }

    const form = this.commentForm;
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

  onSubmit() {
    this.commentUser = this.commentForm.value;
    const d = new Date();
    this.commentUser.date = d.toISOString();
    this.dishcopy.comments.push(this.commentUser);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => {
        this.dish = undefined; this.errMess = <any>errmess
      });
    console.log(this.commentUser);
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
    this.commentFormDirective.resetForm();
  }

}
