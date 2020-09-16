variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "fp_context" {
  type = string
}


variable "sns_topic_name" {
  type    = string
  default = "topic"
}

variable "sqs_queue_name" {
  type    = string
  default = "queue"
}

//data "aws_route53_zone" "route53_zone_domain" {
//  name = var.domain
//}

//
//variable "zone_id" {
//  name = aws_route53_zone.route53_zone_domain.zone_id
//
//}
variable "domain" {
  default = "fightpandemics"
}

provider "aws" {
  region  = var.aws_region
  version = "~> 3.0"
}


resource "aws_sns_topic" "sns_topic" {
  name = var.sns_topic_name
}

# ---------------------------------------------------------------------------------------------------------------------
# SQS QUEUE
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_sqs_queue" "queue" {
  name = var.sqs_queue_name
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.queue_dl.arn
    maxReceiveCount     = 5
  })
  visibility_timeout_seconds = 300
  tags = {
    Environment = var.fp_context
  }
}


resource "aws_sqs_queue" "queue_dl" {
  name = "queue_dl"
}

# ---------------------------------------------------------------------------------------------------------------------
# SQS POLICY
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_sqs_queue_policy" "notifications_queue_policy" {
  queue_url = aws_sqs_queue.queue.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "sqspolicy",
  "Statement": [
    {
      "Sid": "First",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "${aws_sqs_queue.queue.arn}",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "${aws_sns_topic.sns_topic.arn}"
        }
      }
    }
  ]
}
POLICY
}

# ---------------------------------------------------------------------------------------------------------------------
# SNS SUBSCRIPTION
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_sns_topic_subscription" "sqs_target" {
  topic_arn = aws_sns_topic.sns_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.queue.arn
}


# ---------------------------------------------------------------------------------------------------------------------
# LAMBDA EVENT SOURCE MAPPING
# ---------------------------------------------------------------------------------------------------------------------


resource "aws_lambda_event_source_mapping" "queue_lambda_event" {
  batch_size        = 1
  event_source_arn  = aws_sqs_queue.queue.arn
  enabled           = true
  function_name     = aws_lambda_function.lambda.arn
}

#--------------------------------------------------------------------------------------------------------------------
# SES domain identity and the Route53 records associated with it
# ---------------------------------------------------------------------------------------------------------------------


data "aws_route53_zone" "selected" {
  name         = "developement"
  private_zone = false
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = data.aws_route53_zone.selected.name
  type    = "A"
  records = ["10.0.0.1"]
}




//resource "aws_ses_domain_identity" "ms" {
//  domain = var.domain
//}
//
//resource "aws_route53_record" "fp-domain-identity-records" {
//  zone_id = aws_route53_zone.route53_zone_domain.zone_id
//  name    = "_amazonses.mailslurp.com"
//  type    = "TXT"
//  ttl     = "600"
//
//  records = [
//    aws_ses_domain_identity.ms.verification_token,
//  ]
//}

# ses dkim
//resource "aws_ses_domain_dkim" "ms" {
//  domain = aws_ses_domain_identity.ms.domain
//}
//
//resource "aws_route53_record" "ms-dkim-records" {
//  count   = 3
//  zone_id = aws_route53_zone.route53_zone_domain.zone_id
//  name    = "${element(aws_ses_domain_dkim.ms.dkim_tokens, count.index)}._domainkey.mailslurp.com"
//  type    = "CNAME"
//  ttl     = "600"
//
//  records = [
//    "${element(aws_ses_domain_dkim.ms.dkim_tokens, count.index)}.dkim.amazonses.com",
//  ]
//}
//
//# ses mail to records
//resource "aws_route53_record" "ms-mx-records" {
//  zone_id = aws_route53_zone.route53_zone_domain.zone_id
//  name    = var.domain
//  type    = "MX"
//  ttl     = "600"
//
//  records = [
//    "10 inbound-smtp.us-west-2.amazonses.com",
//    "10 inbound-smtp.us-west-2.amazonaws.com",
//  ]
//}
//
//resource "aws_route53_record" "ms-spf-records" {
//  zone_id = aws_route53_zone.route53_zone_domain.zone_id
//  name    = var.domain
//  type    = "TXT"
//  ttl     = "600"
//
//  records = [
//    "v=spf1 include:amazonses.com -all",
//  ]
//}
//
//
//# ses rule set
//resource "aws_ses_receipt_rule_set" "ms" {
//  rule_set_name = "ms_receive_all"
//}
//
//resource "aws_ses_active_receipt_rule_set" "ms" {
//  rule_set_name = "${aws_ses_receipt_rule_set.ms.rule_set_name}"
//
//  depends_on = [
//    "aws_ses_receipt_rule.ms",
//  ]
//}
//
//resource "aws_ses_receipt_rule_set" "main" {
//  rule_set_name = "primary-rules"
//}
