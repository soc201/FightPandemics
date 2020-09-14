# creates the SNS topic on aws

resource "aws_sns_topic" "notifications_updates" {
    name = "notifications-updates-topic"
}


# redrive_policy is used to reference a Dead Letter Queue (DLQ) so that events that cannot be 
# processed are not lost but are queued in our DLQ. 

resource "aws_sqs_queue" "notifications_updates_queue" {
    name = "notifications-updates-queue"
    redrive_policy  = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.notifications_updates_dl_queue.arn}\",\"maxReceiveCount\":5}"
    visibility_timeout_seconds = 300

    tags = {
        Environment = "dev"
    }
}


# This is our Dead Letter Queue, it’s just a simple SQS queue. Just like the one above.

resource "aws_sqs_queue" "notifications_updates_dl_queue" {
    name = "notificaitons-updates-dl-queue"
}


# creates a subscription, which will allow our SQS queue to receive notifications 
# from the SNS topic we created above.

resource "aws_sns_topic_subscription" "notifications_updates_sqs_target" {
    topic_arn = aws_sns_topic.notifications_updates.arn
    protocol  = "sqs"
    endpoint  = "${aws_sqs_queue.notifications_updates_queue.arn}"
}


# Define SQS policy that is needed for our SQS to actually receive events from the SNS topic. 
# instructions listed here: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sqs_queue_policy

resource "aws_sqs_queue_policy" "notifications_updates_queue_policy" {
    queue_url = "${aws_sqs_queue.notifications_updates_queue.id}"

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
      "Resource": "$terr{aws_sqs_queue.notifications_updates_queue.arn}",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "${aws_sns_topic.notifications_updates.arn}"
        }
      }
    }
  ]
}
POLICY
}
