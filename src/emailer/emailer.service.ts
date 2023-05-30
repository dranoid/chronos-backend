import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as Mailgen from 'mailgen';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class EmailerService {
  constructor(private readonly mailerService: MailerService) {}
  private mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Chronos',
      link: 'https://www.google.com/search?q=Chronos+ng',
    },
  });

  async sendSignUpEmail(createUserDto: CreateUserDto) {
    const emailObj = {
      body: {
        name: createUserDto.name,
        intro: [
          'Welcome to Chronos!',
          "We're very excited to have you on board.",
        ],
        outro: [
          'Need help, or have questions?',
          "Just reply to this email, we'd love to help.",
        ],
      },
    };

    const mailHtml = this.mailGenerator.generate(emailObj);
    const mailPlain = this.mailGenerator.generatePlaintext(emailObj);

    const message = {
      to: createUserDto.email, // list of receivers
      from: process.env.USER_EMAIL, // sender address
      subject: 'Welcome!', // Subject line
      text: mailPlain, // plaintext body
      html: mailHtml, // HTML body content
    };

    this.mailerService
      .sendMail(message)
      .then(() => {
        console.log('Sent mail');
      })
      .catch((e) => {
        console.log(e);
        throw new InternalServerErrorException();
      });
  }

  async sendOrderEmail(order, orderId, user) {
    console.log(order, 'here');
    const productList = order.list.map((item) => {
      const obj = {
        name: item.product.name,
        price: item.product.price,
        cost: `NGN ${+item.orderQuantity * +item.product.price}`,
      };
      obj['quantity ordered'] = item.orderQuantity;
      return obj;
    });

    console.log(productList);

    const emailObj = {
      body: {
        name: user.name,
        intro: `You just placed an order! Order Id: ${orderId}`,
        table: {
          data: [...productList],
        },
        outro: [
          'Need help, or have questions?',
          "Just reply to this email, we'd love to help.",
        ],
      },
    };

    const mailHtml = this.mailGenerator.generate(emailObj);
    const mailPlain = this.mailGenerator.generatePlaintext(emailObj);

    const message = {
      to: user.email, // list of receivers
      from: process.env.USER_EMAIL, // sender address
      subject: 'Order has been placed successfully!', // Subject line
      text: mailPlain, // plaintext body
      html: mailHtml, // HTML body content
    };

    this.mailerService
      .sendMail(message)
      .then(() => {
        console.log('Sent mail');
      })
      .catch((e) => {
        console.log(e);
        throw new InternalServerErrorException();
      });
  }
}
