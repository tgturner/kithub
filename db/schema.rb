# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20161014150854) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "comments", force: :cascade do |t|
    t.text     "body"
    t.integer  "teacher_id"
    t.integer  "commentable_id"
    t.string   "commentable_type"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.index ["commentable_type", "commentable_id"], name: "index_comments_on_commentable_type_and_commentable_id", using: :btree
    t.index ["teacher_id"], name: "index_comments_on_teacher_id", using: :btree
  end

  create_table "lesson_plan_contributors", force: :cascade do |t|
    t.integer  "teacher_id"
    t.integer  "lesson_plan_id"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.index ["lesson_plan_id"], name: "index_lesson_plan_contributors_on_lesson_plan_id", using: :btree
    t.index ["teacher_id", "lesson_plan_id"], name: "index_lesson_plan_contributors_on_teacher_id_and_lesson_plan_id", unique: true, using: :btree
    t.index ["teacher_id"], name: "index_lesson_plan_contributors_on_teacher_id", using: :btree
  end

  create_table "lesson_plan_standards", force: :cascade do |t|
    t.integer  "lesson_plan_id"
    t.integer  "standard_id"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.index ["lesson_plan_id", "standard_id"], name: "index_lesson_plan_standards_on_lesson_plan_id_and_standard_id", unique: true, using: :btree
    t.index ["lesson_plan_id"], name: "index_lesson_plan_standards_on_lesson_plan_id", using: :btree
    t.index ["standard_id"], name: "index_lesson_plan_standards_on_standard_id", using: :btree
  end

  create_table "lesson_plan_stars", force: :cascade do |t|
    t.integer  "teacher_id"
    t.integer  "lesson_plan_id"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.index ["lesson_plan_id"], name: "index_lesson_plan_stars_on_lesson_plan_id", using: :btree
    t.index ["teacher_id", "lesson_plan_id"], name: "index_lesson_plan_stars_on_teacher_id_and_lesson_plan_id", unique: true, using: :btree
    t.index ["teacher_id"], name: "index_lesson_plan_stars_on_teacher_id", using: :btree
  end

  create_table "lesson_plans", force: :cascade do |t|
    t.string   "title",                        null: false
    t.text     "content",                      null: false
    t.integer  "teacher_id"
    t.float    "hours"
    t.float    "version",        default: 1.0
    t.integer  "forks",          default: 0
    t.string   "state"
    t.integer  "grade"
    t.string   "subject"
    t.string   "lesson_type"
    t.integer  "parent_plan_id"
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.index ["parent_plan_id"], name: "index_lesson_plans_on_parent_plan_id", using: :btree
    t.index ["teacher_id"], name: "index_lesson_plans_on_teacher_id", using: :btree
  end

  create_table "pull_requests", force: :cascade do |t|
    t.string   "title",              null: false
    t.text     "description"
    t.integer  "parent_plan_id"
    t.integer  "forked_plan_id"
    t.string   "status"
    t.datetime "accept_reject_time"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.index ["forked_plan_id"], name: "index_pull_requests_on_forked_plan_id", using: :btree
    t.index ["parent_plan_id", "forked_plan_id"], name: "index_pull_requests_on_parent_plan_id_and_forked_plan_id", using: :btree
    t.index ["parent_plan_id"], name: "index_pull_requests_on_parent_plan_id", using: :btree
  end

  create_table "standards", force: :cascade do |t|
    t.string   "title",      null: false
    t.string   "state"
    t.string   "subject"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "taggings", force: :cascade do |t|
    t.integer  "lesson_plan_id", null: false
    t.integer  "tag_id",         null: false
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.index ["lesson_plan_id", "tag_id"], name: "index_taggings_on_lesson_plan_id_and_tag_id", unique: true, using: :btree
    t.index ["lesson_plan_id"], name: "index_taggings_on_lesson_plan_id", using: :btree
    t.index ["tag_id"], name: "index_taggings_on_tag_id", using: :btree
  end

  create_table "tags", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "teacher_followings", force: :cascade do |t|
    t.integer  "followed_id"
    t.integer  "follower_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["followed_id", "follower_id"], name: "index_teacher_followings_on_followed_id_and_follower_id", unique: true, using: :btree
    t.index ["followed_id"], name: "index_teacher_followings_on_followed_id", using: :btree
    t.index ["follower_id"], name: "index_teacher_followings_on_follower_id", using: :btree
  end

  create_table "teachers", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "first_name"
    t.string   "last_name"
    t.string   "state"
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "avatar_file_name"
    t.string   "avatar_content_type"
    t.integer  "avatar_file_size"
    t.datetime "avatar_updated_at"
    t.index ["email"], name: "index_teachers_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_teachers_on_reset_password_token", unique: true, using: :btree
  end

  create_table "testers", force: :cascade do |t|
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
    t.string   "avatar_file_name"
    t.string   "avatar_content_type"
    t.integer  "avatar_file_size"
    t.datetime "avatar_updated_at"
  end

end
