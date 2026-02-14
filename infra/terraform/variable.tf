variable "aws_region" {
  default = "ap-south-1"
}

variable "ami_id" {
  description = "Ubuntu 22.04 AMI"
}

variable "public_key_path" {
  description = "Path to SSH public key"
}
