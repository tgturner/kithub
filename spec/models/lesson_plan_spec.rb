require 'rails_helper'

#runs two tests to check if assignment is valid with a title and invalid without title
describe LessonPlan do

  let(:lesson_plan){ create(:lesson_plan) }

  it "is valid with default attributes" do
    expect(lesson_plan).to be_valid
  end

  it "is invalid without default attributes" do
    sad_assignment = build(:lesson_plan, :without_title)
    expect(sad_assignment).to_not be_valid
  end

  it "is invalid with short title" do
    sad_assignment = build(:lesson_plan, :short_title)
    expect(sad_assignment).to_not be_valid
  end

  it "is invalid with long title" do
    sad_assignment = build(:lesson_plan, :long_title)
    expect(sad_assignment).to_not be_valid
  end

  #testing associations
  it { should belong_to(:teacher) }

  it { should belong_to(:parent_plan) }
  it { should have_many(:forked_plans) }

  it { should have_many(:taggings) }
  it { should have_many(:tags) }

  it { should have_many(:pull_requests_received) }
  it { should have_many(:pull_requests_sent) }

  it { should have_many(:lesson_plan_standards) }
  it { should have_many(:standards) }

  it { should have_many(:comments) }

  it { should have_many(:lesson_plan_stars) }
  it { should have_many(:teachers_who_starred) }

  it { should have_many(:lesson_plan_contributors) }
  it { should have_many(:contributors) }

end