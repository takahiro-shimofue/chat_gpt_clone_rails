class Chat < ApplicationRecord
  belongs_to :user
  has_many :messages, dependent: :destroy

  validates :uuid, presence: true, uniqueness: true
end
