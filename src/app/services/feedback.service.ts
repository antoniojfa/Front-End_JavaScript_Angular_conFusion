import { Injectable } from '@angular/core';
import { Feedback } from '../shared/feedback';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { map, catchError } from 'rxjs/operators';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

  submitFeedback(feedback: Feedback): Observable<Feedback> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<Feedback>(baseURL + 'feedbacks', feedback, httpOptions)
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(baseURL + 'feedbacks')
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getFeedbackIds(): Observable<string[] | any> {
    return this.getFeedbacks().pipe(map(feedbacks => feedbacks.map(feedback => feedback.id)))
      .pipe(catchError( error => error ));
  }

}
